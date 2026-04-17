'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tag, Check, Star, Loader2 } from 'lucide-react';
import { updateLabel, getTasksByLabel } from '@/app/actions/label-actions';
import { TaskList } from '@/components/tasks/task-list';
import { QuickAdd } from '@/components/tasks/quick-add';

const PRESET_COLORS = ['#8B5CF6', '#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#06B6D4', '#EC4899'];

export function LabelDetailModal({ label, isOpen, onClose, allProjects = [], allLabels = [] }: any) {
    const [name, setName] = useState(label.name);
    const [color, setColor] = useState(label.color || PRESET_COLORS[0]);
    const [isFavorite, setIsFavorite] = useState(label.isFavorite || false);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            getTasksByLabel(label.name).then((res: any) => {
                setTasks(res);
                setLoading(false);
            });
        }
    }, [isOpen, label.name]);

    const handleSave = async () => {
        await updateLabel(label.id, { name, color, isFavorite });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] h-[85vh] flex flex-col p-0 rounded-[2.5rem] overflow-hidden border-none shadow-2xl">
                {/* PERBAIKAN: Header tersembunyi untuk memenuhi syarat aksesibilitas Shadcn */}
                <DialogHeader className="sr-only">
                    <DialogTitle>Pengaturan Label {label.name}</DialogTitle>
                    <DialogDescription>
                        Ubah nama, warna, atau lihat daftar tugas untuk label ini.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex h-full">
                    {/* SISI KIRI: Pengaturan Label */}
                    <div className="w-[300px] bg-slate-50/50 p-8 border-r border-slate-100 flex flex-col gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Edit Label</label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border-slate-200 focus-visible:ring-purple-500 font-bold" />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warna</label>
                            <div className="grid grid-cols-4 gap-2">
                                {PRESET_COLORS.map((c) => (
                                    <button key={c} onClick={() => setColor(c)} className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center transition-transform active:scale-90" style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}40` : 'none' }}>
                                        {color === c && <Check className="w-4 h-4 text-white" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <span className="text-sm font-bold text-slate-700">Favorit</span>
                            <Switch checked={isFavorite} onCheckedChange={setIsFavorite} />
                        </div>

                        <Button onClick={handleSave} className="mt-auto bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold h-12 shadow-lg shadow-purple-100">
                            Simpan Perubahan
                        </Button>
                    </div>

                    {/* SISI KANAN: List Task & QuickAdd */}
                    <div className="flex-1 flex flex-col bg-white overflow-hidden">
                        <div className="p-8 pb-4 shrink-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-2xl" style={{ backgroundColor: `${color}15`, color: color }}>
                                    <Tag className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 capitalize">{label.name}</h2>
                            </div>
                            {/* QuickAdd dengan default label otomatis */}
                            <QuickAdd projects={allProjects} availableLabels={allLabels} />
                        </div>

                        <ScrollArea className="flex-1 px-8">
                            <div className="pb-8">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Tugas Terkait</label>
                                {loading ? (
                                    <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-200" /></div>
                                ) : (
                                    <TaskList tasks={tasks} allLabels={allLabels} allProjects={allProjects} emptyMessage={`Belum ada tugas dengan label @${label.name}`} />
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}