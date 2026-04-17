'use server';

import { db } from '@/db';
import { tasks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
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