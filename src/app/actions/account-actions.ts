'use server';

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Helper Client Biasa
async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll() }, setAll() { } } }
    );
}

// Helper Admin Client (Bypass RLS & Keamanan untuk fungsi kritikal)
function getAdminSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

// 1. Update Nama Lengkap
export async function updateFullName(fullName: string) {
    const supabase = await getSupabase();
    await supabase.auth.updateUser({ data: { full_name: fullName } });
    revalidatePath('/', 'layout');
    return { success: true };
}

// 2. Upload / Hapus Foto Profil
export async function updateAvatar(formData: FormData) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const file = formData.get('file') as File;
    if (!file) {
        // Mode Hapus Foto
        await supabase.auth.updateUser({ data: { avatar_url: null } });
        revalidatePath('/', 'layout');
        return { success: true };
    }

    // Mode Upload Foto
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

    if (uploadError) return { error: uploadError.message };

    // Dapatkan URL Publik
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
    await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

    revalidatePath('/', 'layout');
    return { success: true };
}

// 3. Update Email (Instan via Admin Bypass)
export async function updateEmailInstantly(newEmail: string) {
    const supabase = await getSupabase();
    const adminAuth = getAdminSupabase().auth;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // Update paksa via admin (tanpa harus klik email konfirmasi lama)
    const { error } = await adminAuth.admin.updateUserById(user.id, {
        email: newEmail,
        email_confirm: true
    });

    if (error) return { error: error.message };

    // Karena email berubah, sesi mungkin harus direfresh
    return { success: true };
}

// 4. Update/Add Password
export async function changeUserPassword(newPassword: string, currentPassword?: string, hasPassword?: boolean) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // Jika user punya password (login email), verifikasi dulu password lamanya
    if (hasPassword && currentPassword) {
        const { error: verifyError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: currentPassword,
        });
        if (verifyError) return { error: 'Current password salah.' };
    }

    // Update ke password baru
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };

    return { success: true };
}

// 5. Delete Account (Permanen)
export async function deleteUserAccount(password: string) {
    const supabase = await getSupabase();
    const adminAuth = getAdminSupabase().auth;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // 1. Verifikasi Password
    const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password,
    });
    if (verifyError) return { error: 'Password salah. Penghapusan dibatalkan.' };

    // 2. Eksekusi Hapus Akun via Admin
    const { error: deleteError } = await adminAuth.admin.deleteUser(user.id);
    if (deleteError) return { error: deleteError.message };

    // 3. Logout
    await supabase.auth.signOut();
    return { success: true };
}