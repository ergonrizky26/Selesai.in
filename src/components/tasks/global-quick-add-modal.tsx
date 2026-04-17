'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Flag, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { quickAddTask } from '@/app/actions/task-actions';

interface GlobalQuickAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    allProjects: any[];
    allLabels: any[];
}

export function GlobalQuickAddModal({ isOpen, onClose, allProjects = [], allLabels = [] }: GlobalQuickAddModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState<Date | undefined>();
    const [priority, setPriority] = useState('p4');
    const [projectId, setProjectId] = useState('');
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form saat modal dibuka kembali
    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setDescription('');
            setDueDate(undefined);
            setPriority('p4');
            setProjectId('');
            setSelectedLabels([]);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const activeProject = allProjects.find(p => p.id === projectId);

    const handleSubmit = async () => {
        // Validasi dasar: Judul tidak boleh kosong
        if (!title.trim()) return;

        try {
            setIsSubmitting(true);

            const res = await quickAddTask(title, {
                description,
                dueDateStr: dueDate ? dueDate.toISOString() : undefined,
                priority,
                projectId: projectId || undefined,
                labels: selectedLabels
            });

            if (res && res.success) {
                onClose();
            } else {
                alert("Gagal menambahkan tugas. Silakan coba lagi.");
            }
        } catch (error) {
            console.error("Submit Error:", error);
            alert("Terjadi kesalahan sistem.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const priorityStyles: Record<string, { active: string, inactive: string, label: string }> = {
        p1: { active: 'bg-red-500 text-white shadow-md', inactive: 'bg-red-50 text-red-500 hover:bg-red-100', label: 'P1' },
        p2: { active: 'bg-orange-500 text-white shadow-md', inactive: 'bg-orange-50 text-orange-500 hover:bg-orange-100', label: 'P2' },
        p3: { active: 'bg-blue-500 text-white shadow-md', inactive: 'bg-blue-50 text-blue-500 hover:bg-blue-100', label: 'P3' },
        p4: { active: 'bg-slate-700 text-white shadow-md', inactive: 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200', label: 'P4' },
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
            <DialogContent
                className="sm:max-w-[750px] p-10 rounded-[2.5rem] border-none shadow-2xl bg-[#f8f9fa] z-[100]"
            // Menambahkan z-index tinggi untuk memastikan tidak terhalang sidebar/overlay
            >
                {/* Aksesibilitas: Judul & Deskripsi Tersembunyi */}
                <DialogHeader className="sr-only">
                    <DialogTitle>Tambah Tugas Cepat</DialogTitle>
                    <DialogDescription>Masukkan detail tugas baru Anda di sini.</DialogDescription>
                </DialogHeader>

                {/* Breadcrumb Proyek */}
                <div className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    WORKSPACE <span className="text-slate-300">›</span> {activeProject ? activeProject.name : 'INBOX'}
                </div>

                <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Buat Tugas Baru</h2>

                <div className="space-y-6">
                    <Input
                        autoFocus
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Apa yang perlu dilakukan?"
                        className="border-none shadow-none text-2xl font-semibold p-0 focus-visible:ring-0 bg-transparent placeholder:text-slate-300"
                    />

                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Tambahkan detail atau catatan..."
                        className="border-none shadow-sm focus-visible:ring-2 focus-visible:ring-purple-200 p-5 min-h-[120px] resize-none text-slate-600 bg-white rounded-2xl"
                    />

                    <div className="grid grid-cols-2 gap-x-12 gap-y-8 pt-4">
                        {/* Sisi Kiri */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Jadwal</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start gap-3 h-12 px-4 rounded-2xl border-none bg-white shadow-sm hover:bg-purple-50 text-slate-600">
                                            <CalendarIcon className="w-5 h-5 text-purple-500" />
                                            {dueDate ? format(dueDate, 'd MMM yyyy', { locale: id }) : 'Pilih tanggal...'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 border-none shadow-2xl rounded-2xl z-[110]">
                                        <Calendar mode="single" selected={dueDate} onSelect={setDueDate} />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Proyek</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start gap-3 h-12 px-4 rounded-2xl border-none bg-white shadow-sm hover:bg-slate-50 text-slate-600">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeProject?.color || '#cbd5e1' }} />
                                            <span className="font-medium">{activeProject?.name || 'Inbox'}</span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-2 rounded-2xl shadow-xl border-none z-[110]">
                                        <button onClick={() => setProjectId('')} className="w-full text-left p-3 hover:bg-slate-50 rounded-xl text-sm flex items-center gap-3 font-medium text-slate-600">
                                            <div className="w-2 h-2 rounded-full bg-slate-300" /> Inbox
                                        </button>
                                        {allProjects.map(p => (
                                            <button key={p.id} onClick={() => setProjectId(p.id)} className="w-full text-left p-3 hover:bg-slate-50 rounded-xl text-sm flex items-center gap-3 font-medium text-slate-600">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} /> {p.name}
                                            </button>
                                        ))}
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Sisi Kanan */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Prioritas</label>
                                <div className="flex gap-2">
                                    {['p4', 'p3', 'p2', 'p1'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPriority(p)}
                                            className={cn(
                                                "flex-1 h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                                                priority === p ? priorityStyles[p].active : priorityStyles[p].inactive
                                            )}
                                        >
                                            <Flag className="w-3 h-3" /> {priorityStyles[p].label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Label</label>
                                <div className="flex flex-wrap items-center gap-2">
                                    {selectedLabels.map(labelName => {
                                        const lData = allLabels.find(l => l.name === labelName);
                                        return (
                                            <span key={labelName} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white shadow-sm border border-slate-100" style={{ color: lData?.color || '#8B5CF6' }}>
                                                {labelName}
                                                <button type="button" onClick={() => setSelectedLabels(prev => prev.filter(l => l !== labelName))} className="hover:text-red-500 opacity-50 hover:opacity-100 transition-colors">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        );
                                    })}
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button type="button" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-purple-600 hover:border-purple-200 shadow-sm transition-colors">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-48 p-2 rounded-2xl shadow-xl border-none z-[110]" align="start">
                                            <div className="max-h-40 overflow-y-auto">
                                                {allLabels.filter(l => !selectedLabels.includes(l.name)).map(l => (
                                                    <button key={l.id} type="button" onClick={() => setSelectedLabels(prev => [...prev, l.name])} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 rounded-xl font-bold flex items-center gap-2" style={{ color: l.color }}>
                                                        {l.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center justify-end gap-4 mt-10 pt-6 border-t border-slate-200/60">
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-xl font-bold text-slate-400 hover:text-slate-600 h-12 px-6"
                    >
                        BATAL
                    </Button>
                    <Button
                        type="button"
                        disabled={!title.trim() || isSubmitting}
                        onClick={handleSubmit}
                        className={cn(
                            "bg-[#6c2bd9] hover:bg-[#5b21b6] text-white rounded-2xl font-bold h-12 px-10 shadow-xl shadow-purple-200 transition-all active:scale-95",
                            (!title.trim() || isSubmitting) && "opacity-50 cursor-not-allowed bg-slate-300 shadow-none"
                        )}
                    >
                        {isSubmitting ? 'MENYIMPAN...' : 'BUAT TUGAS'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}