'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { resetPassword } from '@/app/actions/auth-actions';

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        const formData = new FormData(e.currentTarget);
        const result = await resetPassword(formData);

        if (result?.error) {
            setErrorMsg(result.error);
            setIsLoading(false);
        } else if (result?.success) {
            setIsSuccess(true);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-4">
            <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center">

                {isSuccess ? (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Cek Email Anda</h2>
                        <p className="text-slate-500 text-sm mb-8">
                            Kami telah mengirimkan tautan untuk mengatur ulang kata sandi Anda.
                        </p>
                        <Link href="/login" className="w-full">
                            <Button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg">
                                Kembali ke Login
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Reset Password</h1>
                            <p className="text-slate-500 text-sm">
                                Masukkan email Anda dan kami akan mengirimkan instruksi selanjutnya.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-left">
                            {errorMsg && (
                                <div className="p-3 bg-red-50 text-red-500 text-sm font-bold rounded-xl text-center">
                                    {errorMsg}
                                </div>
                            )}

                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="Alamat Email"
                                    required
                                    disabled={isLoading}
                                    className="pl-12 h-14 rounded-2xl bg-slate-50 border-none font-medium"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 rounded-2xl bg-[#6c2bd9] hover:bg-[#5b21b6] text-white font-bold text-lg shadow-xl shadow-purple-200 mt-4"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Kirim Link Reset'}
                            </Button>
                        </form>

                        <div className="mt-8">
                            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Kembali ke Login
                            </Link>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}