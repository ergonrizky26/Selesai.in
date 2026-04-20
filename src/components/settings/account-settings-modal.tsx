'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    User, CheckCircle2, RefreshCw, Smartphone, Trash2, Pencil, Loader2, AlertCircle, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    updateFullName, updateAvatar, updateEmailInstantly,
    changeUserPassword, deleteUserAccount
} from '@/app/actions/account-actions';
import { useRouter } from 'next/navigation';

interface AccountSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

type ViewState = 'main' | 'email' | 'password' | 'delete';

export function AccountSettingsModal({ isOpen, onClose, user }: AccountSettingsModalProps) {
    const router = useRouter();
    const [view, setView] = useState<ViewState>('main');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // User Data
    const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pengguna';
    const email = user?.email || '';
    const initials = fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

    // Cek apakah user punya metode login 'email' (punya password)
    const hasPassword = user?.app_metadata?.providers?.includes('email');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // === HANDLERS ===

    const resetState = () => {
        setView('main');
        setErrorMsg('');
        setIsLoading(false);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    // 1. Photo & Name
    const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        const res = await updateAvatar(formData);

        if (res?.success) {
            // PENTING: Memicu Next.js untuk mengambil data user terbaru dari Server Component
            router.refresh();
        } else if (res?.error) {
            setErrorMsg(res.error);
        }

        setIsLoading(false);
    };

    const handleRemovePhoto = async () => {
        setIsLoading(true);
        const formData = new FormData(); // Kosong menandakan hapus

        const res = await updateAvatar(formData);

        if (res?.success) {
            router.refresh(); // Segarkan data agar avatar kembali ke inisial
        }

        setIsLoading(false);
    };

    const handleNameChange = async (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value && e.target.value !== fullName) {
            await updateFullName(e.target.value);
        }
    };

    // 2. Email Change
    const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        const fd = new FormData(e.currentTarget);
        const newEmail = fd.get('newEmail') as string;
        const confirmEmail = fd.get('confirmEmail') as string;

        if (newEmail !== confirmEmail) {
            setErrorMsg('Email konfirmasi tidak cocok.');
            setIsLoading(false); return;
        }

        const res = await updateEmailInstantly(newEmail);
        if (res?.error) setErrorMsg(res.error);
        else {
            // Force relogin if needed, or just redirect
            window.location.reload();
        }
        setIsLoading(false);
    };

    // 3. Password Change
    const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        const fd = new FormData(e.currentTarget);
        const currentPass = fd.get('currentPassword') as string;
        const newPass = fd.get('newPassword') as string;
        const confirmPass = fd.get('confirmPassword') as string;

        if (newPass !== confirmPass) {
            setErrorMsg('Konfirmasi password tidak cocok.');
            setIsLoading(false); return;
        }

        const res = await changeUserPassword(newPass, currentPass, hasPassword);
        if (res?.error) setErrorMsg(res.error);
        else resetState();

        setIsLoading(false);
    };

    // 4. Delete Account
    const handleDeleteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        const fd = new FormData(e.currentTarget);
        const pass = fd.get('password') as string;

        const res = await deleteUserAccount(pass);
        if (res?.error) {
            setErrorMsg(res.error);
            setIsLoading(false);
        } else {
            router.push('/login'); // Berhasil dihapus & ter-logout otomatis
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[750px] h-[520px] p-0 rounded-[2rem] overflow-hidden border-none shadow-2xl bg-white flex gap-0">

                {/* SISI KIRI (Tetap) */}
                <div className="w-56 bg-slate-50 border-r border-slate-100 flex flex-col p-6 pt-10">
                    <nav className="flex-1 space-y-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold bg-white text-purple-700 shadow-sm border border-slate-100">
                            <User className="w-4 h-4" /> Account
                        </button>
                    </nav>
                </div>

                {/* SISI KANAN (Dinamis berdasarkan 'view') */}
                <div className="flex-1 flex flex-col relative bg-white overflow-hidden">

                    {/* VIEW: MAIN (Pengaturan Utama) */}
                    {view === 'main' && (
                        <div className="flex-1 overflow-y-auto p-8 animate-in fade-in slide-in-from-right-4">
                            <div className="mb-6">
                                <h2 className="text-2xl font-extrabold text-slate-900">Account Settings</h2>
                                <p className="text-sm font-medium text-slate-500 mt-1">Personalize your digital identity.</p>
                            </div>

                            {/* Profile Photo */}
                            <div className="mb-6">
                                <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-3">Profile Photo</label>
                                <div className="flex items-center gap-5">
                                    <Avatar className="w-16 h-16 shadow-md border-2 border-white">
                                        <AvatarImage src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${email}&backgroundColor=8b5cf6`} />
                                        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex items-center gap-2">
                                        <input type="file" ref={fileInputRef} onChange={handleUploadPhoto} accept="image/*" className="hidden" />
                                        <Button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="bg-[#6c2bd9] hover:bg-[#5b21b6] text-white rounded-full px-5 font-bold text-xs h-9 shadow-md">
                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Change photo'}
                                        </Button>
                                        <Button onClick={handleRemovePhoto} disabled={isLoading} variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full px-5 font-bold text-xs h-9">
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Input Form (Name & Email) */}
                            <div className="grid grid-cols-2 gap-5 mb-6">
                                <div>
                                    <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-2">Full Name</label>
                                    <div className="relative">
                                        <Input defaultValue={fullName} onBlur={handleNameChange} disabled={isLoading} className="h-11 bg-slate-50 border-none rounded-2xl font-semibold text-slate-700 pl-4 pr-10" />
                                        <Pencil className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-2">Email Address</label>
                                    <div className="h-11 bg-slate-50 rounded-2xl flex items-center justify-between px-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-700 truncate max-w-[130px]">{email}</span>
                                            <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600"><CheckCircle2 className="w-3 h-3" /> Verified</div>
                                        </div>
                                        <button onClick={() => setView('email')} className="text-xs font-bold text-purple-600 hover:text-purple-800">Change</button>
                                    </div>
                                </div>
                            </div>

                            {/* Security */}
                            <div className="mb-6">
                                <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-3">Security</label>
                                <div className="flex gap-3">
                                    <Button onClick={() => setView('password')} className="bg-[#41F0D0] hover:bg-[#20dfbf] text-teal-950 font-bold rounded-full h-9 px-4 text-xs shadow-sm flex items-center gap-2">
                                        <RefreshCw className="w-3 h-3" /> {hasPassword ? 'Change Password' : 'Add Password'}
                                    </Button>
                                    <Button variant="outline" className="border-slate-200 text-slate-600 font-bold rounded-full h-9 px-4 text-xs flex items-center gap-2">
                                        <Smartphone className="w-3 h-3" /> Enable 2FA
                                    </Button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="flex items-center justify-between p-3.5 bg-red-50/50 rounded-2xl border border-red-100">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Danger Zone</h4>
                                    <p className="text-[11px] font-medium text-slate-500">Remove account and data.</p>
                                </div>
                                <button
                                    onClick={() => setView('delete')}
                                    className={cn("flex items-center gap-2 text-xs font-bold", hasPassword ? "text-red-600 hover:text-red-700" : "text-red-300 cursor-not-allowed")}
                                    disabled={!hasPassword}
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </div>
                    )}

                    {/* VIEW: CHANGE EMAIL */}
                    {view === 'email' && (
                        <form onSubmit={handleEmailSubmit} className="flex flex-col h-full animate-in fade-in slide-in-from-right-4">
                            <div className="p-8 flex-1">
                                <button type="button" onClick={resetState} className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900"><ArrowLeft className="w-4 h-4" /> Back to Settings</button>
                                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Update Email</h2>
                                <p className="text-sm font-medium text-slate-500 mb-6">Current email: <span className="text-slate-900 font-bold">{email}</span></p>
                                {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl border border-red-100">{errorMsg}</div>}

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">New Email</label>
                                        <Input name="newEmail" type="email" required className="h-12 bg-slate-50 border-none rounded-2xl font-semibold" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Confirm New Email</label>
                                        <Input name="confirmEmail" type="email" required className="h-12 bg-slate-50 border-none rounded-2xl font-semibold" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
                                <Button type="button" variant="ghost" onClick={resetState} className="font-bold text-slate-500">Cancel</Button>
                                <Button type="submit" disabled={isLoading} className="bg-[#6c2bd9] text-white font-bold rounded-xl px-8">{isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Change Email'}</Button>
                            </div>
                        </form>
                    )}

                    {/* VIEW: PASSWORD (Change / Add) */}
                    {view === 'password' && (
                        <form onSubmit={handlePasswordSubmit} className="flex flex-col h-full animate-in fade-in slide-in-from-right-4">
                            <div className="p-8 flex-1">
                                <button type="button" onClick={resetState} className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900"><ArrowLeft className="w-4 h-4" /> Back to Settings</button>
                                <h2 className="text-2xl font-extrabold text-slate-900 mb-6">{hasPassword ? 'Change Password' : 'Add Password'}</h2>
                                {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl border border-red-100">{errorMsg}</div>}

                                <div className="space-y-4">
                                    {hasPassword && (
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Current Password</label>
                                            <Input name="currentPassword" type="password" required className="h-12 bg-slate-50 border-none rounded-2xl font-semibold" />
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">New Password</label>
                                        <Input name="newPassword" type="password" required minLength={6} className="h-12 bg-slate-50 border-none rounded-2xl font-semibold" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Confirm New Password</label>
                                        <Input name="confirmPassword" type="password" required minLength={6} className="h-12 bg-slate-50 border-none rounded-2xl font-semibold" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
                                <Button type="button" variant="ghost" onClick={resetState} className="font-bold text-slate-500">Cancel</Button>
                                <Button type="submit" disabled={isLoading} className="bg-[#6c2bd9] text-white font-bold rounded-xl px-8">{isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : (hasPassword ? 'Change Password' : 'Add Password')}</Button>
                            </div>
                        </form>
                    )}

                    {/* VIEW: DELETE ACCOUNT */}
                    {view === 'delete' && (
                        <form onSubmit={handleDeleteSubmit} className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 bg-red-50/30">
                            <div className="p-8 flex-1">
                                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Sayonara.</h2>
                                <p className="text-sm font-medium text-slate-600 mb-6 leading-relaxed">
                                    Terima kasih telah menggunakan Selesai.in untuk mengelola produktivitas Anda.
                                    Menghapus akun bersifat <strong>permanen</strong>. Semua tugas, proyek, dan data Anda akan musnah tanpa sisa.
                                </p>
                                {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-600 text-xs font-bold rounded-xl border border-red-200">{errorMsg}</div>}

                                <div>
                                    <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-2">Confirm Password</label>
                                    <Input name="password" type="password" placeholder="Masukkan password untuk konfirmasi..." required className="h-12 bg-white border-red-100 rounded-2xl font-semibold" />
                                </div>
                            </div>
                            <div className="p-5 border-t border-red-100 bg-white flex justify-end gap-3 shrink-0">
                                <Button type="button" variant="ghost" onClick={resetState} className="font-bold text-slate-500">Cancel</Button>
                                <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl px-8 shadow-xl shadow-red-200">{isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Delete Account'}</Button>
                            </div>
                        </form>
                    )}

                </div>
            </DialogContent>
        </Dialog>
    );
}