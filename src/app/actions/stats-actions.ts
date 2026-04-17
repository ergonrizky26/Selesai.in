'use server';

import { db } from '@/db';
import { tasks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSessionUser() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll() }, setAll() { } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function getUserStats() {
    const user = await getSessionUser();
    if (!user) return { totalTasks: 0, completedTasks: 0, currentStreak: 0, totalToday: 0, completedToday: 0, progress: 0 };

    // 1. Ambil semua tugas (sekarang kita juga butuh dueDate untuk filter hari ini)
    const allTasks = await db.query.tasks.findMany({
        where: eq(tasks.userId, user.id),
        columns: { status: true, updatedAt: true, dueDate: true }
    });

    const completedTasks = allTasks.filter(t => t.status === 'done');

    // --- LOGIKA PROGRESS HARI INI ---
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Ambil tugas yang dijadwalkan hari ini atau belum punya tanggal (Inbox)
    const todayTasks = allTasks.filter(t => {
        if (!t.dueDate) return true;
        return new Date(t.dueDate) <= endOfToday;
    });

    const totalToday = todayTasks.length;
    const completedToday = todayTasks.filter(t => t.status === 'done').length;
    // Hitung persentase progres (cegah pembagian dengan 0)
    const progress = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

    // --- ALGORITMA STREAK HARIAN ---
    const getLocalDateString = (date: Date | null) => {
        if (!date) return null;
        const d = new Date(date);
        d.setHours(d.getHours() + 7);
        return d.toISOString().split('T')[0];
    };

    const activeDates = [...new Set(
        completedTasks
            .map(t => getLocalDateString(t.updatedAt))
            .filter((d): d is string => d !== null)
    )].sort((a, b) => b.localeCompare(a));

    let currentStreak = 0;
    const todayStr = getLocalDateString(new Date());

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    if (activeDates.length > 0 && (activeDates[0] === todayStr || activeDates[0] === yesterdayStr)) {
        currentStreak = 1;
        let currentDate = new Date(activeDates[0]);

        for (let i = 1; i < activeDates.length; i++) {
            const prevDate = new Date(activeDates[i]);
            const expectedDate = new Date(currentDate);
            expectedDate.setDate(expectedDate.getDate() - 1);

            if (prevDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
                currentStreak++;
                currentDate = prevDate;
            } else {
                break;
            }
        }
    }

    // 3. KEMBALIKAN SEMUA DATA YANG DIBUTUHKAN DASHBOARD
    return {
        totalTasks: allTasks.length,
        completedTasks: completedTasks.length,
        currentStreak,
        totalToday,
        completedToday,
        progress
    };
}