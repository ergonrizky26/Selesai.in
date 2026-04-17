'use server';

import { db } from '@/db';
import { labels } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
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

export async function createLabel(data: { name: string, color: string, isFavorite: boolean }) {
    const user = await getSessionUser();
    if (!user) throw new Error('Unauthorized');

    await db.insert(labels).values({
        userId: user.id,
        name: data.name.toLowerCase(),
        color: data.color,
        isFavorite: data.isFavorite
    });

    revalidatePath('/dashboard/labels');
    return { success: true };
}

export async function getUserLabels() {
    const user = await getSessionUser();
    if (!user) return [];
    return await db.query.labels.findMany({
        where: eq(labels.userId, user.id),
        orderBy: [labels.name]
    });
}

// 1. Aksi untuk Update Label
export async function updateLabel(labelId: string, data: { name: string, color: string, isFavorite: boolean }) {
    const user = await getSessionUser();
    if (!user) throw new Error('Unauthorized');

    await db.update(labels)
        .set({
            name: data.name.toLowerCase(),
            color: data.color,
            isFavorite: data.isFavorite
        })
        .where(and(eq(labels.id, labelId), eq(labels.userId, user.id)));

    revalidatePath('/dashboard/labels');
    return { success: true };
}

// 2. Aksi untuk Mengambil Tugas berdasarkan Label String
export async function getTasksByLabel(labelName: string) {
    const user = await getSessionUser();
    if (!user) return [];

    return await db.query.tasks.findMany({
        where: (tasks, { and, eq, sql }) => and(
            eq(tasks.userId, user.id),
            eq(tasks.status, 'todo'),
            // PERBAIKAN: Gunakan ::text[] agar cocok dengan tipe data kolom di Postgres
            sql`${tasks.labels} @> ARRAY[${labelName}]::text[]`
        ),
        orderBy: (tasks, { asc, desc }) => [asc(tasks.priority), desc(tasks.createdAt)]
    });
}