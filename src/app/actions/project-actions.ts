'use server';

import { db } from '@/db';
import { projects, tasks } from '@/db/schema';
import { eq, sql, and } from 'drizzle-orm';
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

// 1. Fungsi dari Fase 4 (Dikembalikan)
export async function getActiveProjects() {
    const user = await getSessionUser();
    if (!user) return [];

    const userProjects = await db
        .select({
            id: projects.id,
            name: projects.name,
            color: projects.color,
            // Total semua tugas dalam proyek ini
            taskCount: sql<number>`count(${tasks.id})`.mapWith(Number),
            // Hanya hitung tugas yang berstatus 'done'
            completedCount: sql<number>`count(${tasks.id}) filter (where ${tasks.status} = 'done')`.mapWith(Number),
            // Hanya hitung tugas yang berstatus 'todo' (sisa tugas)
            remainingCount: sql<number>`count(${tasks.id}) filter (where ${tasks.status} = 'todo')`.mapWith(Number),
        })
        .from(projects)
        .leftJoin(tasks, eq(projects.id, tasks.projectId))
        .where(eq(projects.userId, user.id))
        .groupBy(projects.id)
        .orderBy(projects.name);

    return userProjects;
}

// 2. Fungsi dari Fase 9 (Tetap Dipertahankan)
export async function getDetailedProjects() {
    const user = await getSessionUser();
    if (!user) return [];

    const userProjects = await db
        .select({
            id: projects.id,
            name: projects.name,
            color: projects.color,
            activeTasks: sql<number>`count(${tasks.id}) filter (where ${tasks.status} = 'todo')`.mapWith(Number),
            completedTasks: sql<number>`count(${tasks.id}) filter (where ${tasks.status} = 'done')`.mapWith(Number),
        })
        .from(projects)
        .leftJoin(tasks, eq(projects.id, tasks.projectId))
        .where(eq(projects.userId, user.id))
        .groupBy(projects.id)
        .orderBy(projects.name);

    return userProjects;
}

export async function createProject(data: { name: string; color: string }) {
    const user = await getSessionUser();
    if (!user) throw new Error('Unauthorized');

    await db.insert(projects).values({
        userId: user.id,
        name: data.name,
        color: data.color,
    });

    // Revalidate semua halaman yang menampilkan proyek
    revalidatePath('/dashboard/projects');
    revalidatePath('/dashboard');
    return { success: true };
}

