'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// PERBAIKAN: Fungsi getSupabase dengan penanganan setAll cookie yang benar
async function getSupabase() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set({ name, value, ...options });
                        });
                    } catch (error) {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing user sessions.
                    }
                },
            },
        }
    );
}

// 1. Fungsi Register (Daftar)
export async function signUpWithEmail(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const supabase = await getSupabase();

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName, // Menyimpan nama ke metadata Supabase
            },
        },
    });

    if (error) return { error: error.message };
    return { success: true };
}

// 2. Fungsi Login (Masuk)
export async function signInWithEmail(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = await getSupabase();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) return { error: error.message };
    return { success: true };
}

// 3. Fungsi Login dengan Google
export async function signInWithGoogle() {
    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            // Pastikan URL ini mengarah ke file route handler callback Anda (contoh: /auth/callback)
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    });

    if (data.url) redirect(data.url);
}


// 4. BARU: Fungsi Forgot Password
export async function resetPassword(formData: FormData) {
    const email = formData.get('email') as string;
    const supabase = await getSupabase();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/update-password`,
    });

    if (error) return { error: error.message };
    return { success: true };
}

export async function signOutUser() {
    const supabase = await getSupabase();

    // Hapus sesi di Supabase
    await supabase.auth.signOut();

    // Arahkan kembali ke halaman login
    redirect('/login');
}