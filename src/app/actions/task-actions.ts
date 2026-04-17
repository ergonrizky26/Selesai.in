'use server';

import { db } from '@/db';
// PERBAIKAN 1: Pastikan 'profiles' di-import dari schema
import { tasks, profiles, projects } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { parseTaskInput } from '@/lib/nlp';
import { eq, desc, and, lte, gt, isNull, or, asc } from 'drizzle-orm';

async function getSessionUser() {
    // ... (kode getSessionUser tetap sama seperti sebelumnya)
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                    } catch (error) { }
                }
            }
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Tambahkan parameter opsional pada fungsi quickAddTask
export async function quickAddTask(rawInput: string, overrides?: {
    description?: string;
    projectId?: string;
    dueDateStr?: string; // <--- Perubahan di sini
    priority?: string;
    labels?: string[];
}) {
    try {
        const user = await getSessionUser();
        if (!user) throw new Error('Unauthorized');

        await db.insert(profiles)
            .values({ id: user.id, email: user.email || 'no-email@selesai.in' })
            .onConflictDoNothing({ target: profiles.id });

        // 1. Bedah teks NLP
        const parsedData = parseTaskInput(rawInput);

        // 2. Gabungkan Label (NLP + Manual Picker)
        // Kita gunakan Set agar tidak ada label ganda
        const combinedLabels = Array.from(new Set([
            ...(parsedData.labels || []),
            ...(overrides?.labels || [])
        ]));

        // 3. Tentukan Proyek
        const finalProjectId = overrides?.projectId || (parsedData.projectName ? await getOrCreateProject(user.id, parsedData.projectName) : null);

        // 4. LOGIKA PRIORITAS: Jika form tombol (overrides) mengirim selain 'p4', maka itu yang menang.
        const finalPriority = (overrides?.priority && overrides.priority !== 'p4')
            ? overrides.priority
            : parsedData.priority;

        // 5. PARSE TANGGAL KEMBALI: Kembalikan string ISO menjadi Objek Date untuk database
        const finalDueDate = overrides?.dueDateStr
            ? new Date(overrides.dueDateStr)
            : parsedData.dueDate;

        // 6. Simpan ke Database
        await db.insert(tasks).values({
            userId: user.id,
            projectId: overrides?.projectId || (parsedData.projectName ? await getOrCreateProject(user.id, parsedData.projectName) : null),
            title: parsedData.title,
            description: overrides?.description || null,
            dueDate: finalDueDate,     // <--- Gunakan finalDueDate
            priority: finalPriority,   // <--- Gunakan finalPriority yang sudah diverifikasi
            labels: combinedLabels,
            status: 'todo',
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Error adding task:', error);
        return { success: false, error: error.message };
    }
}

// Action: Mengambil Tugas Hari Ini (Termasuk Overdue & Tanpa Tanggal)
export async function getTodayTasks() {
    const user = await getSessionUser();
    if (!user) return [];

    // Batas akhir hari ini (jam 23:59:59)
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    return await db.query.tasks.findMany({
        where: and(
            eq(tasks.userId, user.id),
            eq(tasks.status, 'todo'), // Hanya ambil yang belum selesai
            or(
                lte(tasks.dueDate, endOfToday), // Tanggal hari ini atau sebelumnya (overdue)
                isNull(tasks.dueDate)           // Atau tugas yang belum di-set tanggalnya
            )
        ),
        // PERBAIKAN LOGIKA: Pastikan P1 ('p1') teratas secara alfabetis
        orderBy: [
            asc(tasks.priority), // P1 teratas, P4 terbawah
            desc(tasks.createdAt) // Kemudian yang terbaru
        ],
    });
}

// Action: Mengambil Tugas Mendatang (Besok dan seterusnya)
export async function getUpcomingTasks() {
    const user = await getSessionUser();
    if (!user) return [];

    // Batas akhir hari ini (jam 23:59:59)
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const upcomingTasks = await db.query.tasks.findMany({
        where: and(
            eq(tasks.userId, user.id),
            eq(tasks.status, 'todo'),
            gt(tasks.dueDate, endOfToday) // Tanggal harus lebih besar dari hari ini
        ),
        orderBy: [desc(tasks.dueDate)], // Urutkan berdasarkan tanggal terdekat
    });

    return upcomingTasks;
}

// Action: Mengambil tugas yang belum selesai (untuk dropdown Focus Mode)
export async function getIncompleteTasks() {
    const user = await getSessionUser();
    if (!user) return [];

    const userTasks = await db.query.tasks.findMany({
        where: eq(tasks.userId, user.id),
        orderBy: [desc(tasks.createdAt)],
    });

    // Filter manual sederhana untuk MVP (bisa dioptimasi di query nantinya)
    return userTasks.filter(task => task.status === 'todo');
}

// Action: Menandai tugas sebagai selesai
export async function completeTask(taskId: string) {
    try {
        const user = await getSessionUser();
        if (!user) throw new Error('Unauthorized');

        await db.update(tasks)
            .set({
                status: 'done',
                isCompleted: true,
                updatedAt: new Date()
            })
            .where(eq(tasks.id, taskId));

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/focus');

        return { success: true };
    } catch (error: any) {
        console.error('Error completing task:', error);
        return { success: false, error: error.message };
    }
}

// Action: Menghapus tugas
export async function deleteTask(taskId: string) {
    try {
        const user = await getSessionUser();
        if (!user) throw new Error('Unauthorized');

        await db.delete(tasks)
            .where(and(
                eq(tasks.id, taskId),
                eq(tasks.userId, user.id) // Keamanan ganda: pastikan ini milik user tsb
            ));

        revalidatePath('/dashboard');

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting task:', error);
        return { success: false, error: error.message };
    }
}

// Action: Mengambil tugas berdasarkan Project ID
export async function getTasksByProject(projectId: string) {
    const user = await getSessionUser();
    if (!user) return [];

    const projectTasks = await db.query.tasks.findMany({
        where: and(
            eq(tasks.userId, user.id),
            eq(tasks.projectId, projectId),
            eq(tasks.status, 'todo') // Hanya ambil yang belum selesai
        ),
        orderBy: [asc(tasks.priority), desc(tasks.createdAt)],
    });

    return projectTasks;
}

// Action: Ambil Detail Proyek Tunggal
export async function getProjectById(projectId: string) {
    const user = await getSessionUser();
    if (!user) return null;

    return await db.query.projects.findFirst({
        where: and(
            eq(projects.id, projectId),
            eq(projects.userId, user.id)
        ),
    });
}

// Helper function internal (pastikan ada di file yang sama)
async function getOrCreateProject(userId: string, name: string) {
    const existing = await db.query.projects.findFirst({
        where: and(eq(projects.userId, userId), eq(projects.name, name))
    });
    if (existing) return existing.id;

    const res = await db.insert(projects).values({ userId, name, color: '#8B5CF6' }).returning({ id: projects.id });
    return res[0].id;
}