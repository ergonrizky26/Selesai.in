'use server';

import { db } from '@/db';
import { tasks, comments, profiles } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
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

// 1. Aksi untuk Update Judul & Deskripsi Tugas
export async function updateTaskDetails(taskId: string, title: string, description: string | null) {
    const user = await getSessionUser();
    if (!user) throw new Error('Unauthorized');

    await db.update(tasks)
        .set({ title, description, updatedAt: new Date() })
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)));

    revalidatePath('/dashboard');
    return { success: true };
}

// 2. Aksi untuk Mengambil Komentar beserta Email Profil
export async function getTaskComments(taskId: string) {
    const user = await getSessionUser();
    if (!user) return [];

    return await db
        .select({
            id: comments.id,
            content: comments.content,
            createdAt: comments.createdAt,
            userEmail: profiles.email,
        })
        .from(comments)
        .leftJoin(profiles, eq(comments.userId, profiles.id))
        .where(eq(comments.taskId, taskId))
        .orderBy(asc(comments.createdAt));
}

// 3. Aksi untuk Menambah Komentar Baru
export async function addComment(taskId: string, content: string) {
    const user = await getSessionUser();
    if (!user) throw new Error('Unauthorized');

    await db.insert(comments).values({
        taskId,
        userId: user.id,
        content,
    });

    // --- PERBAIKAN 2: Instruksi "Nuklir" untuk mereset semua cache data tugas ---
    // Parameter 'layout' memastikan seluruh halaman tersinkronisasi sempurna
    revalidatePath('/', 'layout');

    return { success: true };
}

// Tambahkan fungsi update task yang lebih fleksibel
export async function updateTaskMetadata(taskId: string, updates: {
    priority?: string;
    dueDate?: Date | null;
    projectId?: string | null;
    labels?: string[];
}) {
    const user = await getSessionUser();
    if (!user) throw new Error('Unauthorized');

    await db.update(tasks)
        .set({
            ...updates,
            updatedAt: new Date()
        })
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)));

    revalidatePath('/dashboard');
    return { success: true };
}