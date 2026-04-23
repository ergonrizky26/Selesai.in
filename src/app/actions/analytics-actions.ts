'use server';

import { db } from '@/db';
import { focusSessions, tasks, projects, userPreferences } from '@/db/schema';
import { eq, gte, lte, and, or } from 'drizzle-orm';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { subDays, format, differenceInDays, parseISO } from 'date-fns';

async function getSessionUser() {
    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll() { return cookieStore.getAll() }, setAll() { } } });
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function getAnalyticsData(daysFilter: number = 7, customFrom?: string, customTo?: string) {
    const user = await getSessionUser();
    if (!user) throw new Error('Unauthorized');

    const today = new Date();

    // --- SETUP RENTANG WAKTU FILTER ---
    let endDate = today;
    let activeStartDate = subDays(today, daysFilter - 1);
    let periodDays = daysFilter;

    if (customFrom && customTo) {
        activeStartDate = new Date(customFrom);
        activeStartDate.setHours(0, 0, 0, 0);
        endDate = new Date(customTo);
        endDate.setHours(23, 59, 59, 999);
        periodDays = Math.max(1, differenceInDays(endDate, activeStartDate) + 1);
    }

    const prevStartDate = subDays(activeStartDate, periodDays);
    const prevEndDate = subDays(endDate, periodDays);
    const filterDateForHeatmap = subDays(today, 365);

    // 1. AMBIL DATA DARI DATABASE
    const allSessions = await db.query.focusSessions.findMany({
        where: (focusSessions, { and, eq, gte }) => and(
            eq(focusSessions.userId, user.id),
            gte(focusSessions.completedAt, filterDateForHeatmap) // Ambil 1 thn utk heatmap
        ),
        orderBy: (focusSessions, { desc }) => [desc(focusSessions.completedAt)],
    });

    const allProjects = await db.query.projects.findMany({
        where: eq(projects.userId, user.id)
    });

    // --- AMBIL TARGET FOKUS PENGGUNA DARI DATABASE ---
    const prefs = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, user.id)
    });
    const userGoal = prefs?.weeklyFocusGoal || 10; // Default 10 jika belum pernah set

    // TAMBAHKAN: Ambil semua tugas untuk mapping label
    const allTasks = await db.query.tasks.findMany({ where: eq(tasks.userId, user.id) });

    // --- PROSES STATISTIK DINAMIS BERDASARKAN FILTER ---
    let thisPeriodMinutes = 0;
    let lastPeriodMinutes = 0;
    let activeSessionsCount = 0;
    const labelMap: Record<string, number> = {}; // Untuk Radar Chart

    const heatmapMap: Record<string, number> = {};
    const projectFocusMap: Record<string, number> = {};
    const uniqueDates = new Set<string>();

    // --- PROSES STATISTIK ---
    const hourMap: Record<number, number> = {}; // Untuk Peak Time (0-23)

    // Inisialisasi 24 jam dengan angka 0
    for (let i = 0; i < 24; i++) hourMap[i] = 0;

    allSessions.forEach(session => {
        const sessionDate = new Date(session.completedAt);
        const dateStr = format(sessionDate, 'yyyy-MM-dd');

        // SELALU DIHITUNG UNTUK HEATMAP & STREAK (365 HARI)
        heatmapMap[dateStr] = (heatmapMap[dateStr] || 0) + 1;
        uniqueDates.add(dateStr);

        // HANYA DIHITUNG JIKA MASUK DALAM RENTANG FILTER (Contoh: 7 hari terakhir)
        if (sessionDate >= activeStartDate && sessionDate <= endDate) {
            thisPeriodMinutes += session.durationMinutes;
            // LOGIKA PEMETAAN LABEL
            if (session.taskId) {
                const task = allTasks.find(t => t.id === session.taskId);
                if (task && task.labels && Array.isArray(task.labels)) {
                    task.labels.forEach((label: string) => {
                        labelMap[label] = (labelMap[label] || 0) + session.durationMinutes;
                    });
                }
            }
            activeSessionsCount++;

            if (session.projectId) {
                projectFocusMap[session.projectId] = (projectFocusMap[session.projectId] || 0) + session.durationMinutes;
            } else {
                projectFocusMap['unassigned'] = (projectFocusMap['unassigned'] || 0) + session.durationMinutes;
            }
            // LOGIKA PEAK PRODUCTIVITY TIME
            const hour = sessionDate.getHours();
            hourMap[hour] = (hourMap[hour] || 0) + 1;
        }
        // Untuk komparasi tren (Minggu lalu vs Minggu ini)
        else if (sessionDate >= prevStartDate && sessionDate <= prevEndDate) {
            lastPeriodMinutes += session.durationMinutes;
        }
    });

    // --- PROSES PEAK TIME DATA ---
    const peakTimeData = Object.keys(hourMap).map(hour => ({
        hour: `${hour.padStart(2, '0')}:00`,
        sessions: hourMap[parseInt(hour)],
        // Tandai sebagai peak jika ini adalah jam tersibuk
        isPeak: hourMap[parseInt(hour)] === Math.max(...Object.values(hourMap)) && Math.max(...Object.values(hourMap)) > 0
    }));

    // Tentukan Insight Berdasarkan Jam Terbanyak
    const maxHour = parseInt(Object.keys(hourMap).reduce((a, b) => hourMap[parseInt(a)] > hourMap[parseInt(b)] ? a : b));
    let timeInsight = "Belum ada pola";

    if (Math.max(...Object.values(hourMap)) > 0) {
        if (maxHour >= 5 && maxHour < 12) timeInsight = "Morning Bird 🌅";
        else if (maxHour >= 12 && maxHour < 17) timeInsight = "Day Cruiser ☀️";
        else if (maxHour >= 17 && maxHour < 21) timeInsight = "Evening Flow 🌆";
        else timeInsight = "Night Owl 🦉";
    }

    // TREN & INSIGHT
    const periodText = daysFilter === 7 && !customFrom ? 'last week' : 'previous period';
    let focusTrend = { percentage: 0, isPositive: true, text: "No change" };

    if (lastPeriodMinutes === 0) {
        if (thisPeriodMinutes > 0) focusTrend = { percentage: 100, isPositive: true, text: `↗ +100% (New start!)` };
    } else {
        const rawPercentage = ((thisPeriodMinutes - lastPeriodMinutes) / lastPeriodMinutes) * 100;
        const roundedPercentage = Math.round(rawPercentage);
        const isPositive = roundedPercentage >= 0;
        focusTrend = {
            percentage: roundedPercentage,
            isPositive,
            text: `${isPositive ? '↗ +' : '↘ '}${roundedPercentage}% from ${periodText}`
        };
    }

    // HITUNG TOTAL & RATA-RATA BERDASARKAN FILTER (Bukan 365 hari)
    const totalHours = (thisPeriodMinutes / 60).toFixed(1);
    const avgSession = activeSessionsCount > 0 ? Math.round(thisPeriodMinutes / activeSessionsCount) : 0;

    let sessionInsight = { text: "Belum ada sesi", colorClass: "text-slate-400" };
    if (avgSession > 0 && avgSession < 15) sessionInsight = { text: "⚠ Terlalu singkat (Rawan distraksi)", colorClass: "text-amber-500" };
    else if (avgSession >= 15 && avgSession <= 35) sessionInsight = { text: "✨ Pomodoro ideal tercapai", colorClass: "text-emerald-500" };
    else if (avgSession > 35 && avgSession <= 60) sessionInsight = { text: "🧠 Zona Deep Work (Fokus tajam)", colorClass: "text-indigo-500" };
    else if (avgSession > 60) sessionInsight = { text: "🔥 Mode Maraton (Awas burnout!)", colorClass: "text-rose-500" };

    // STREAK LOGIC (Tetap membaca 365 hari untuk akurasi rekor)
    let currentStreak = 0;
    let checkDate = today;
    while (true) {
        const checkStr = format(checkDate, 'yyyy-MM-dd');
        if (uniqueDates.has(checkStr)) {
            currentStreak++;
            checkDate = subDays(checkDate, 1);
        } else if (currentStreak === 0 && format(checkDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
            checkDate = subDays(checkDate, 1);
        } else {
            break;
        }
    }

    const sortedDates = Array.from(uniqueDates).sort();
    let maxStreak = 0; let tempStreak = 0;
    if (sortedDates.length > 0) {
        tempStreak = 1; maxStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
            if (differenceInDays(parseISO(sortedDates[i]), parseISO(sortedDates[i - 1])) === 1) {
                tempStreak++;
                if (tempStreak > maxStreak) maxStreak = tempStreak;
            } else tempStreak = 1;
        }
    }

    let streakInsight = { text: "Mulai streak-mu!", colorClass: "text-slate-400" };
    if (currentStreak === 0 && maxStreak > 0) streakInsight = { text: `Rekor terbaik: ${maxStreak} hari`, colorClass: "text-slate-400" };
    else if (currentStreak >= maxStreak && currentStreak > 1) streakInsight = { text: "🔥 Personal Record!", colorClass: "text-emerald-500" };
    else if (currentStreak === 1) streakInsight = { text: "🌟 Langkah awal yang bagus!", colorClass: "text-blue-500" };
    else if (currentStreak > 1) streakInsight = { text: `💪 ${maxStreak - currentStreak + 1} hari lagi pecah rekor!`, colorClass: "text-amber-500" };

    // PROSES HEATMAP
    const heatmapData = [];
    for (let i = 365; i >= 0; i--) {
        const d = subDays(today, i);
        const dateStr = format(d, 'yyyy-MM-dd');
        const count = heatmapMap[dateStr] || 0;
        let level = 0;
        if (count > 0 && count <= 2) level = 1;
        else if (count > 2 && count <= 4) level = 2;
        else if (count > 4 && count <= 6) level = 3;
        else if (count > 6) level = 4;
        heatmapData.push({ date: dateStr, count, level });
    }

    // PROSES PROJECT FOCUS
    const colors = ['#6c2bd9', '#3b82f6', '#0d9488', '#eab308', '#f43f5e'];
    let projectFocusData = Object.keys(projectFocusMap).map((projId, index) => {
        let name = 'Unassigned';
        if (projId !== 'unassigned') {
            const proj = allProjects.find(p => p.id === projId);
            if (proj) name = proj.name;
        }
        return { name, value: Math.round((projectFocusMap[projId] / thisPeriodMinutes) * 100), color: colors[index % colors.length] };
    }).filter(p => p.value > 0).sort((a, b) => b.value - a.value).slice(0, 4);

    if (projectFocusData.length === 0) projectFocusData = [{ name: 'No Data', value: 100, color: '#e2e8f0' }];

    // PROSES VELOCITY 
    const velocityData: { dateStr: string; name: string; completed: number; created: number }[] = [];
    const loopDays = Math.min(periodDays, 31); // Batasi maks 31 titik agar grafik tidak menyempit

    for (let i = loopDays - 1; i >= 0; i--) {
        const d = subDays(endDate, i);
        velocityData.push({
            dateStr: format(d, 'yyyy-MM-dd'),
            name: loopDays > 7 ? format(d, 'MMM dd') : format(d, 'EEE'), // Jika 30 hari, pakai tgl (Apr 12), jika 7 hari pakai Hari (MON)
            completed: 0,
            created: 0,
        });
    }

    const recentTasks = await db.query.tasks.findMany({
        where: (tasks, { eq, and, or, gte, lte }) => and(
            eq(tasks.userId, user.id),
            or(
                and(gte(tasks.createdAt, activeStartDate), lte(tasks.createdAt, endDate)),
                and(gte(tasks.updatedAt, activeStartDate), lte(tasks.updatedAt, endDate))
            )
        )
    });

    // 3. Masukkan data tugas ke keranjang hari yang tepat
    recentTasks.forEach(task => {
        // Cek kapan tugas DIBUAT (Pastikan createdAt tidak null)
        if (task.createdAt) {
            const createdDateStr = format(new Date(task.createdAt), 'yyyy-MM-dd');
            const createdMatch = velocityData.find(v => v.dateStr === createdDateStr);
            if (createdMatch) {
                createdMatch.created++;
            }
        }

        // Cek kapan tugas DISELESAIKAN (Pastikan status done & updatedAt tidak null)
        if (task.status === 'done' && task.updatedAt) {
            const completedDateStr = format(new Date(task.updatedAt), 'yyyy-MM-dd');
            const completedMatch = velocityData.find(v => v.dateStr === completedDateStr);
            if (completedMatch) {
                completedMatch.completed++;
            }
        }
    });

    // --- PROSES RADAR CHART (LABEL DISTRIBUTION) ---
    const labelData = Object.keys(labelMap).map(label => ({
        subject: label.charAt(0).toUpperCase() + label.slice(1),
        value: labelMap[label],
        fullMark: Math.max(...Object.values(labelMap), 100)
    })).sort((a, b) => b.value - a.value).slice(0, 6); // Ambil 6 label teratas agar radar tidak penuh

    // --- PROSES EXPORT REPORT ---
    const exportData = allSessions
        .filter(s => {
            const d = new Date(s.completedAt);
            return d >= activeStartDate && d <= endDate;
        })
        .map(s => ({
            date: format(new Date(s.completedAt), 'yyyy-MM-dd HH:mm'),
            duration: s.durationMinutes,
            project: allProjects.find(p => p.id === s.projectId)?.name || 'Unassigned',
            task: allTasks.find(t => t.id === s.taskId)?.title || 'No Task'
        }));

    return {
        stats: { totalHours, avgSession, streak: currentStreak, focusTrend, sessionInsight, streakInsight, timeInsight, userGoal },
        heatmapData,
        velocityData,
        projectFocusData,
        labelData, // KIRIM DATA LABEL KE UI
        peakTimeData, // KIRIM DATA PEAK TIME KE UI
        exportData
    };
}

export async function updateFocusGoal(newGoal: number) {
    const user = await getSessionUser();
    if (!user) return { error: 'Unauthorized' };

    try {
        // Upsert: Masukkan baru jika belum ada, update jika sudah ada
        await db.insert(userPreferences)
            .values({ userId: user.id, weeklyFocusGoal: newGoal })
            .onConflictDoUpdate({
                target: userPreferences.userId,
                set: { weeklyFocusGoal: newGoal }
            });
        return { success: true };
    } catch (error) {
        console.error("Gagal menyimpan target fokus:", error);
        return { error: 'Gagal menyimpan' };
    }
}