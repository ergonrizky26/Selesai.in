'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Plus, Check } from 'lucide-react';
import { createLabel } from '@/app/actions/label-actions';

const PRESET_COLORS = [
    '#8B5CF6', '#EF4444', '#F97316', '#F59E0B',
    '#10B981', '#3B82F6', '#06B6D4', '#EC4899'
];

export function CreateLabelModal() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [color, setColor] = useState(PRESET_COLORS[0]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name) return;
        setLoading(true);
        await createLabel({ name, color, isFavorite });
        setOpen(false);
        setName('');
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-6 font-bold shadow-lg shadow-purple-100">
                    <Plus className="w-5 h-5 mr-2" />
                    Tambah Label
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-8 border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-slate-900">Label Baru</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nama Label</label>
                        <Input
                            placeholder="Misal: Belanja, Urgent..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="rounded-xl border-slate-100 focus-visible:ring-purple-500 h-12"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Warna Label</label>
                        <div className="flex flex-wrap gap-3">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    // PERBAIKAN 1: Hapus ring-2 dan ring-transparent dari className
                                    className="w-8 h-8 rounded-full border-2 border-white transition-all flex items-center justify-center"
                                    // PERBAIKAN 2: Gunakan boxShadow standar CSS sebagai pengganti ringColor
                                    style={{
                                        backgroundColor: c,
                                        boxShadow: color === c ? `0 0 0 2px ${c}` : 'none'
                                    }}
                                >
                                    {color === c && <Check className="w-4 h-4 text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                        <div className="space-y-0.5">
                            <label className="text-sm font-bold text-slate-700">Favorit</label>
                            <p className="text-xs text-slate-500">Muncul di baris teratas</p>
                        </div>
                        <Switch checked={isFavorite} onCheckedChange={setIsFavorite} />
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="flex-1 rounded-xl h-12 font-bold">Batal</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !name}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-purple-100"
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Label'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}