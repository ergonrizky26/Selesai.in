'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Send, AlignLeft, MessageSquare, Flag, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { updateTaskMetadata, updateTaskDetails, getTaskComments, addComment } from '@/app/actions/task-detail-actions';

interface TaskDetailModalProps {
    task: any;
    isOpen: boolean;
    onClose: () => void;
    allProjects?: any[];
    allLabels?: any[];
    readOnly?: boolean;
}

export function TaskDetailModal({ task, isOpen, onClose, allProjects = [], allLabels = [], readOnly = false }: TaskDetailModalProps) {
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State untuk Metadata
    const [priority, setPriority] = useState(task?.priority || 'p4');
    const [dueDate, setDueDate] = useState<Date | null>(task?.dueDate ? new Date(task.dueDate) : null);
    const [projectId, setProjectId] = useState(task?.projectId || '');
    const [selectedLabels, setSelectedLabels] = useState<string[]>(task?.labels || []);

    // Ref untuk debounce auto-save
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 2. PERBAIKAN: Sync state setiap kali tugas yang diklik berubah
    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setPriority(task.priority || 'p4');
            setDueDate(task.dueDate ? new Date(task.dueDate) : null);
            setProjectId(task.projectId || '');
            setSelectedLabels(task.labels || []);
        }
    }, [task]);

    // Fungsi untuk Update Metadata Instan
    const handleUpdate = async (updates: any) => {
        if (!task) return; // Proteksi tambahan
        await updateTaskMetadata(task.id, updates);
    };

    // Ambil komentar saat modal dibuka
    useEffect(() => {
        if (isOpen && task?.id) {
            getTaskComments(task.id).then(setComments);
        }
    }, [isOpen, task?.id]);

    // Fungsi Auto-save untuk Edit Task
    const handleAutoSave = (newTitle: string, newDesc: string) => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            if (newTitle.trim() && (newTitle !== task.title || newDesc !== task.description)) {
                await updateTaskDetails(task.id, newTitle, newDesc);
            }
        }, 1000);
    };

    const handleSendComment = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);

        const res = await addComment(task.id, newComment);
        if (res.success) {
            setNewComment('');
            const updatedComments = await getTaskComments(task.id);
            setComments(updatedComments);
        }
        setIsSubmitting(false);
    };

    // 3. PERBAIKAN: Proteksi render. Letakkan ini SETELAH semua hooks (useState, useEffect)
    if (!task) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* PERBAIKAN LEBAR MODAL: Menjadi max-w-[850px] agar pas untuk 2 kolom */}
            <DialogContent className="sm:max-w-[850px] h-[85vh] flex flex-col p-0 rounded-[2rem] overflow-hidden border-none shadow-2xl bg-white">

                <div className="flex h-full w-full">

                    {/* ================= SISI KIRI: Judul, Deskripsi, & Komentar ================= */}
                    <div className="flex-1 flex flex-col border-r border-slate-100 overflow-hidden">

                        <div className="p-8 space-y-4 shrink-0">
                            <Input
                                value={title}
                                readOnly={readOnly}
                                onChange={(e) => {
                                    if (readOnly) return;
                                    setTitle(e.target.value);
                                    handleAutoSave(e.target.value, description);
                                }}
                                className={cn("border-none shadow-none text-3xl font-bold p-0 focus-visible:ring-0 h-auto", readOnly && "focus-visible:ring-transparent cursor-default")}
                            />
                            <div className="flex gap-3 text-slate-400">
                                <AlignLeft className="w-5 h-5 shrink-0 mt-1" />
                                <Textarea
                                    value={description}
                                    readOnly={readOnly}
                                    onChange={(e) => {
                                        if (readOnly) return;
                                        setDescription(e.target.value);
                                        handleAutoSave(title, e.target.value);
                                    }}
                                    className={cn("border-none shadow-none focus-visible:ring-0 p-0 min-h-[60px] resize-none text-slate-600", readOnly && "focus-visible:ring-transparent cursor-default")}
                                    placeholder={readOnly ? "Tidak ada deskripsi." : "Tambahkan deskripsi..."}
                                />
                            </div>
                        </div>

                        <ScrollArea className="flex-1 px-8">
                            <div className="space-y-6 pb-6">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                                    <MessageSquare className="w-4 h-4" /> Komentar
                                </div>

                                {comments.length === 0 ? (
                                    <p className="text-center text-sm text-slate-400 py-4">Belum ada komentar. Jadilah yang pertama!</p>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-4 group">
                                            <Avatar className="w-8 h-8 shrink-0 border border-slate-100 shadow-sm">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.userEmail}&backgroundColor=8b5cf6`} />
                                                <AvatarFallback>{comment.userEmail?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {comment.userEmail?.split('@')[0]}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {format(new Date(comment.createdAt), 'd MMM, HH:mm', { locale: id })}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100">
                                                    {comment.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>

                        {/* Form Input Komentar */}
                        {!readOnly && (
                            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                                <div className="flex items-end gap-3">
                                    <Textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Tulis komentar..."
                                        className="min-h-[50px] max-h-[120px] rounded-2xl border-slate-200 focus-visible:ring-purple-500 resize-none text-sm"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendComment();
                                            }
                                        }}
                                    />
                                    <Button
                                        disabled={!newComment.trim() || isSubmitting}
                                        onClick={handleSendComment}
                                        className="bg-purple-600 hover:bg-purple-700 rounded-xl h-11 w-11 p-0 shrink-0 shadow-lg shadow-purple-100"
                                    >
                                        <Send className="w-5 h-5 -ml-0.5" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* <--- AKHIR SISI KIRI (Perhatikan penutup div ini!) */}


                    {/* ================= SISI KANAN: Metadata Sidebar ================= */}
                    <div className={cn("w-[260px] bg-slate-50/50 p-6 space-y-8 shrink-0 overflow-y-auto", readOnly && "opacity-80 pointer-events-none")}>
                        {/* Dengan menambahkan 'pointer-events-none' pada div pembungkus sisi kanan di atas 
                            saat mode readOnly, semua tombol Popover, Calendar, dan Label otomatis TIDAK BISA DIKLIK!
                        */}

                        {/* Proyek Section */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Proyek</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" className="w-full justify-start gap-2 h-10 px-3 rounded-xl hover:bg-white border-transparent hover:border-slate-200 border bg-white shadow-sm">
                                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: allProjects.find(p => p.id === projectId)?.color || '#cbd5e1' }} />
                                        <span className="truncate text-sm font-medium text-slate-700">{allProjects.find(p => p.id === projectId)?.name || 'Inbox'}</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-56 p-2 rounded-2xl shadow-xl border-none">
                                    {allProjects.map(p => (
                                        <button key={p.id} onClick={() => { setProjectId(p.id); handleUpdate({ projectId: p.id }); }} className="w-full text-left p-2 hover:bg-slate-50 rounded-xl text-xs flex items-center gap-2 font-medium text-slate-600">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} /> {p.name}
                                        </button>
                                    ))}
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Prioritas Section */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prioritas</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['p1', 'p2', 'p3', 'p4'].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => { setPriority(p); handleUpdate({ priority: p }); }}
                                        className={cn(
                                            "flex items-center justify-center h-10 rounded-xl border transition-all",
                                            priority === p ? "bg-white border-slate-200 shadow-sm" : "border-transparent opacity-40 hover:opacity-100 hover:bg-slate-100"
                                        )}
                                    >
                                        <Flag className={cn("w-4 h-4", p === 'p1' ? 'text-red-500 fill-red-500' : p === 'p2' ? 'text-orange-500 fill-orange-500' : p === 'p3' ? 'text-blue-500 fill-blue-500' : 'text-slate-400')} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Jadwal Section */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jadwal</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" className="w-full justify-start gap-2 h-10 px-3 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 bg-white shadow-sm">
                                        <CalendarIcon className="w-4 h-4 text-purple-500 shrink-0" />
                                        <span className="text-sm font-medium text-slate-700">{dueDate ? format(dueDate, 'd MMM yyyy', { locale: id }) : 'Set Tanggal'}</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 border-none shadow-2xl rounded-2xl">
                                    <Calendar mode="single" selected={dueDate || undefined} onSelect={(d) => { setDueDate(d || null); handleUpdate({ dueDate: d }); }} />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Labels Section */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Label</label>
                            <div className="flex flex-wrap gap-2">
                                {allLabels.map(l => (
                                    <button
                                        key={l.id}
                                        onClick={() => {
                                            const next = selectedLabels.includes(l.name) ? selectedLabels.filter(n => n !== l.name) : [...selectedLabels, l.name];
                                            setSelectedLabels(next);
                                            handleUpdate({ labels: next });
                                        }}
                                        className={cn(
                                            "text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all",
                                            selectedLabels.includes(l.name)
                                                ? "border-purple-200 bg-purple-50 text-purple-700 shadow-sm"
                                                : "border-slate-200 text-slate-500 hover:bg-white bg-transparent"
                                        )}
                                    >
                                        {l.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                    {/* <--- AKHIR SISI KANAN */}

                </div>
            </DialogContent>
        </Dialog>
    );
}