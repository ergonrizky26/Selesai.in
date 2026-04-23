'use server';

import { db } from '@/db';
import { tasks, focusSessions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

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

export async function getFocusTasks() {
    const user = await getSessionUser();
    if (!user) return [];

    // Ambil tugas 'todo', urutkan dari Prioritas Tertinggi (p1) ke terendah
    const focusQueue = await db.query.tasks.findMany({
        where: and(eq(tasks.userId, user.id), eq(tasks.status, 'todo')),
        orderBy: (tasks, { asc, desc }) => [asc(tasks.priority), desc(tasks.createdAt)],
        limit: 5 // Ambil 5 teratas untuk antrean
    });

    return focusQueue;
}

export async function saveFocusSession(durationMinutes: number, taskId?: string, projectId?: string) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll() }, setAll() { } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    try {
        await db.insert(focusSessions).values({
            userId: user.id,
            taskId: taskId || null,
            projectId: projectId || null,
            durationMinutes,
        });

        // Memicu Next.js untuk memperbarui cache halaman Analytics
        revalidatePath('/dashboard/analytics');
        revalidatePath('/dashboard/focus'); // Jika ada statistik di halaman focus

        return { success: true };
    } catch (error) {
        console.error("Gagal menyimpan sesi fokus:", error);
        return { error: 'Gagal menyimpan sesi' };
    }
}