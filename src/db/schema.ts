import { pgTable, uuid, text, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';

// Tabel Profiles (Disinkronkan dengan Supabase Auth secara manual)
export const profiles = pgTable('profiles', {
    // Menghapus .references(() => users.id) agar tidak error saat push
    // ID ini akan secara logis menyimpan UUID dari auth.users Supabase
    id: uuid('id').primaryKey(),
    email: text('email').notNull(),
    fullName: text('full_name'),
    avatarUrl: text('avatar_url'),
    streakCount: varchar('streak_count').default('0'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Tabel Projects
export const projects = pgTable('projects', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => profiles.id).notNull(), // Relasi ini aman karena profiles ada di public
    name: text('name').notNull(),
    color: varchar('color', { length: 7 }).default('#8B5CF6'), // Default Lavender
    createdAt: timestamp('created_at').defaultNow(),
});

// Tabel Tasks
export const tasks = pgTable('tasks', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => profiles.id).notNull(),
    projectId: uuid('project_id').references(() => projects.id),
    title: text('title').notNull(),
    description: text('description'),
    status: varchar('status', { length: 20 }).default('todo'), // todo, in_progress, done
    priority: varchar('priority', { length: 20 }).default('p4'),
    dueDate: timestamp('due_date'),
    // LOGIKA BARU: Tambahkan kolom array untuk menyimpan multiple labels
    labels: text('labels').array(),
    isCompleted: boolean('is_completed').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const labels = pgTable('labels', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => profiles.id).notNull(),
    name: text('name').notNull(),
    color: varchar('color', { length: 7 }).default('#8B5CF6'), // Hex color
    isFavorite: boolean('is_favorite').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

export const comments = pgTable('comments', {
    id: uuid('id').defaultRandom().primaryKey(),
    taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').references(() => profiles.id).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});