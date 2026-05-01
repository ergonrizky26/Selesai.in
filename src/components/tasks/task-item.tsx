'use client';

import { useState } from 'react';
import { Circle, CheckCircle2, Trash2, Calendar as CalendarIcon, Loader2, Tag, AlignLeft, X, Timer, Sun, Sunrise, Sofa, CalendarDays, XCircle } from 'lucide-react';
import { format, isBefore, startOfToday, addDays, nextSaturday, nextMonday, isYesterday } from 'date-fns';
import { id } from 'date-fns/locale';
import { deleteTask, completeTaskWithInjection, rescheduleTask } from '@/app/actions/task-actions';
import { TaskDetailModal } from '@/components/tasks/task-detail-modal';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

export function TaskItem({ task, allLabels = [], allProjects = [] }: { task: any, allLabels?: any[], allProjects?: any[] }) {
    const router = useRouter();
    const [isCompleted, setIsCompleted] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const [customTime, setCustomTime] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    const priorityConfig: Record<string, { color: string, icon: string, bg: string }> = {
        p1: { color: '#ef4444', icon: 'text-red-500', bg: 'bg-red-50/30' },
        p2: { color: '#f97316', icon: 'text-orange-500', bg: 'bg-orange-50/30' },
        p3: { color: '#3b82f6', icon: 'text-blue-500', bg: 'bg-blue-50/30' },
        p4: { color: 'transparent', icon: 'text-slate-300', bg: 'bg-white' },
    };

    const safePriority = (task.priority || 'p4').toLowerCase();
    const currentConfig = priorityConfig[safePriority] || priorityConfig.p4;

    const playDoneSound = () => {
        const doneSound = new Audio('/sounds/done-click.mp3'); // Sesuaikan path audio Anda
        doneSound.volume = 0.3;
        doneSound.play().catch(e => console.log('Audio blocked by browser', e));
    };

    const handleComplete = async (duration: number) => {
        setIsUpdating(true);
        playDoneSound();
        try {
            await completeTaskWithInjection(task.id, task.projectId, duration);
            setIsCompleted(true);
            router.refresh();
        } catch (error) {
            console.error(error);
            setIsUpdating(false);
        }
    };

    // ✅ FUNGSI RESCHEDULE
    // ✅ UPDATE: Buat event (e) menjadi opsional
    const handleReschedule = async (newDate: Date | null, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        await rescheduleTask(task.id, newDate);
        router.refresh();
    };

    if (isCompleted) return null;

    return (
        <>
            <div
                className={`flex items-start gap-4 p-4 border-y border-r border-slate-100 rounded-xl shadow-sm transition-all duration-300 group border-l-4 ${currentConfig.bg} ${isDeleting || isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                style={{ borderLeftColor: currentConfig.color }}
            >
                {showPrompt ? (
                    // ... (Bagian Micro Prompt sama seperti sebelumnya)
                    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="flex items-center gap-2 text-slate-700">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            <span className="text-sm font-bold">Waktu dihabiskan?</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {!showCustomInput ? (
                                <>
                                    {[15, 30, 60].map(mins => (
                                        <button key={mins} onClick={() => handleComplete(mins)} className="bg-white border border-slate-200 hover:bg-purple-50 text-slate-600 hover:text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">{mins}m</button>
                                    ))}
                                    <button onClick={() => setShowCustomInput(true)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"><Timer className="w-3.5 h-3.5" /> Custom</button>
                                    <button onClick={() => handleComplete(25)} className="bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">Skip ⏭️</button>
                                    <button onClick={() => setShowPrompt(false)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors ml-1"><X className="w-4 h-4" /></button>
                                </>
                            ) : (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                                    <input type="number" placeholder="Menit..." className="w-20 px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-purple-500 shadow-sm" value={customTime} onChange={(e) => setCustomTime(e.target.value)} autoFocus />
                                    <button onClick={() => handleComplete(Number(customTime) || 25)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 text-xs rounded-lg font-bold shadow-sm transition-colors">Simpan</button>
                                    <button onClick={() => setShowCustomInput(false)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"><X className="w-4 h-4" /></button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <button onClick={() => setShowPrompt(true)} disabled={isUpdating} className={`${currentConfig.icon} mt-0.5 hover:opacity-80 transition-colors`}>
                            {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Circle className="w-5 h-5" />}
                        </button>

                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setIsModalOpen(true)}>
                            <h4 className="text-slate-700 font-semibold truncate leading-tight group-hover:text-purple-700 transition-colors">{task.title}</h4>
                            {task.description && (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 flex items-start gap-1.5"><AlignLeft className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-50" /><span>{task.description}</span></p>
                            )}

                            <div className="flex items-center flex-wrap gap-2 mt-2 text-[10px] font-bold uppercase tracking-wider">
                                {/* ✅ UPDATE: IMPLEMENTASI POPOVER RESCHEDULE */}
                                {/* ✅ UPDATE 1: Buat variabel status overdue agar kode lebih rapi */}
                                {task.dueDate && (() => {
                                    const taskDate = new Date(task.dueDate);
                                    const isTaskOverdue = isBefore(taskDate, startOfToday());
                                    const isTaskYesterday = isYesterday(taskDate);
                                    return (
                                        <Popover>
                                            <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <button className={cn(
                                                    "flex items-center gap-1.5 px-2 py-0.5 rounded-md border shadow-sm transition-colors hover:bg-slate-50",
                                                    isTaskOverdue
                                                        ? "border-red-200 text-red-600 bg-red-50"
                                                        : "border-slate-200 text-slate-600 bg-white"
                                                )}>
                                                    <CalendarIcon className={cn("w-3 h-3", isTaskOverdue ? "text-red-500" : "text-purple-500")} />
                                                    {/* ✅ UPDATE 2: Jika kemarin, tampilkan teks "Kemarin". Jika tidak, format normal */}
                                                    {isTaskYesterday ? 'Kemarin' : format(taskDate, 'd MMM yyyy', { locale: id })}
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-2 rounded-xl shadow-xl" align="start">
                                                <div className="flex flex-col sm:flex-row gap-2">

                                                    {/* BAGIAN KIRI: QUICK ACTIONS */}
                                                    <div className="space-y-1 w-48 shrink-0">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 pb-1">Reschedule</p>
                                                        <button onClick={(e) => handleReschedule(new Date(), e)} className="w-full flex items-center justify-between p-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-purple-700 rounded-lg transition-colors">
                                                            <div className="flex items-center gap-2"><Sun className="w-4 h-4 text-emerald-500" /> Hari Ini</div>
                                                        </button>
                                                        <button onClick={(e) => handleReschedule(addDays(new Date(), 1), e)} className="w-full flex items-center justify-between p-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-purple-700 rounded-lg transition-colors">
                                                            <div className="flex items-center gap-2"><Sunrise className="w-4 h-4 text-orange-500" /> Besok</div>
                                                        </button>
                                                        <button onClick={(e) => handleReschedule(nextSaturday(new Date()), e)} className="w-full flex items-center justify-between p-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-purple-700 rounded-lg transition-colors">
                                                            <div className="flex items-center gap-2"><Sofa className="w-4 h-4 text-blue-500" /> Akhir Pekan</div>
                                                        </button>
                                                        <button onClick={(e) => handleReschedule(nextMonday(new Date()), e)} className="w-full flex items-center justify-between p-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-purple-700 rounded-lg transition-colors">
                                                            <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-purple-500" /> Minggu Depan</div>
                                                        </button>
                                                        <div className="h-px bg-slate-100 my-1"></div>
                                                        <button onClick={(e) => handleReschedule(null, e)} className="w-full flex items-center gap-2 p-2 text-sm text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors">
                                                            <XCircle className="w-4 h-4" /> Hapus Tanggal
                                                        </button>
                                                    </div>

                                                    {/* GARIS PEMISAH UNTUK DESKTOP */}
                                                    <div className="hidden sm:block w-px bg-slate-100 mx-1"></div>
                                                    <div className="block sm:hidden h-px bg-slate-100 my-1"></div>

                                                    {/* BAGIAN KANAN: CUSTOM CALENDAR */}
                                                    <div className="p-1">
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={task.dueDate ? new Date(task.dueDate) : undefined}
                                                            onSelect={(date) => {
                                                                if (date) handleReschedule(date);
                                                            }}
                                                            initialFocus
                                                            className="pointer-events-auto"
                                                        />
                                                    </div>

                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    );
                                })()}

                                {/* ✅ UPDATE 3: LABEL EXPLICIT "TERLEWAT" */}
                                {task.dueDate && isBefore(new Date(task.dueDate), startOfToday()) && (
                                    <span className="flex items-center gap-1 bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-md shadow-sm">
                                        ⚠️ Terlewat
                                    </span>
                                )}

                                {/* Render Label */}
                                {task.labels?.map((labelName: string) => {
                                    const labelData = allLabels.find(l => l.name.toLowerCase() === labelName.toLowerCase());
                                    const labelColor = labelData?.color || '#8B5CF6';
                                    return (
                                        <span key={labelName} className="flex items-center gap-1 px-2 py-0.5 rounded-md border" style={{ backgroundColor: `${labelColor}10`, color: labelColor, borderColor: `${labelColor}30` }}>
                                            <Tag className="w-3 h-3" /> {labelName}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        <button onClick={async () => { setIsDeleting(true); await deleteTask(task.id); setIsDeleting(false); }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>

            <TaskDetailModal task={task} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} allProjects={allProjects} allLabels={allLabels} />
        </>
    );
}