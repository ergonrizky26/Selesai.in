'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '@/app/actions/auth-actions';
import { cn } from '@/lib/utils';
import Link from 'next/link'; // <-- Tambahkan baris ini di jajaran import atas

export function AuthForm() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            const formData = new FormData(e.currentTarget);
            const result = mode === 'login'
                ? await signInWithEmail(formData)
                : await signUpWithEmail(formData);

            if (result?.error) {
                setErrorMsg(result.error);
                setIsLoading(false); // Berhenti loading jika ada error
            } else if (result?.success) {
                // PERBAIKAN: Gunakan window.location untuk hard redirect jika router.push terasa lambat
                // Ini memastikan state auth di middleware benar-benar terbaca ulang
                window.location.href = '/dashboard';
            }
        } catch (err) {
            console.error(err);
            setErrorMsg('Terjadi kesalahan yang tidak terduga.');
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">

            {/* Header & Toggle */}
            <div className="text-center mb-8">
                {/* Update: Warna Brand Selesai.in */}
                <h1 className="text-4xl font-black text-[#6c2bd9] mb-2 tracking-tight">
                    Selesai.in
                </h1>

                {/* Update: Greeting dinamis */}
                <p className="text-slate-500 text-sm mb-6 font-medium">
                    {mode === 'login' ? 'Selamat datang kembali! 👋' : 'Mari mulai perjalanan produktif Anda.'}
                </p>

                <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center relative">
                    <div
                        className={cn(
                            "absolute h-[calc(100%-12px)] w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out",
                            mode === 'register' ? "translate-x-full" : "translate-x-0"
                        )}
                    />
                    <button
                        type="button"
                        onClick={() => setMode('login')}
                        className={cn("flex-1 py-2 text-sm font-bold z-10 transition-colors", mode === 'login' ? "text-slate-900" : "text-slate-400")}
                    >
                        Masuk
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('register')}
                        className={cn("flex-1 py-2 text-sm font-bold z-10 transition-colors", mode === 'register' ? "text-slate-900" : "text-slate-400")}
                    >
                        Daftar
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                    <div className="p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl text-center border border-red-100 animate-in fade-in slide-in-from-top-1">
                        {errorMsg}
                    </div>
                )}

                <div className={cn("space-y-4 overflow-hidden transition-all duration-300", mode === 'register' ? "max-h-24 opacity-100" : "max-h-0 opacity-0")}>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            name="fullName"
                            placeholder="Nama Lengkap"
                            required={mode === 'register'}
                            disabled={isLoading}
                            className="pl-12 h-14 rounded-2xl bg-slate-50 border-none font-medium focus-visible:ring-2 focus-visible:ring-purple-200"
                        />
                    </div>
                </div>

                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        name="email"
                        type="email"
                        placeholder="Alamat Email"
                        required
                        disabled={isLoading}
                        className="pl-12 h-14 rounded-2xl bg-slate-50 border-none font-medium focus-visible:ring-2 focus-visible:ring-purple-200"
                    />
                </div>

                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        name="password"
                        type="password"
                        placeholder="Password"
                        required
                        disabled={isLoading}
                        minLength={6}
                        className="pl-12 h-14 rounded-2xl bg-slate-50 border-none font-medium focus-visible:ring-2 focus-visible:ring-purple-200"
                    />
                </div>

                {/* PERBAIKAN: Gunakan Link dan manipulasi class Tailwind untuk state disabled */}
                {mode === 'login' && (
                    <div className="flex justify-end pt-1">
                        <Link
                            href="/forgot-password"
                            className={cn(
                                "text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors",
                                isLoading && "pointer-events-none opacity-50 cursor-not-allowed"
                            )}
                        >
                            Lupa Password?
                        </Link>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 rounded-2xl bg-[#6c2bd9] hover:bg-[#5b21b6] text-white font-bold text-lg shadow-xl shadow-purple-200 mt-4 transition-all active:scale-[0.98]"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Memproses...</span>
                        </div>
                    ) : (
                        mode === 'login' ? 'Masuk' : 'Buat Akun'
                    )}
                </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Atau</span>
                <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Social Login */}
            <form action={signInWithGoogle}>
                <Button
                    type="submit"
                    disabled={isLoading}
                    variant="outline"
                    className="w-full h-14 rounded-2xl border-slate-200 hover:bg-slate-50 font-bold text-slate-600 flex items-center gap-3 shadow-sm transition-all active:scale-[0.98]"
                >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Lanjutkan dengan Google
                </Button>
            </form>

        </div>
    );
}