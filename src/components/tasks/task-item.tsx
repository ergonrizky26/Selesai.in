'use client';

import { useState } from 'react';
// ✅ UPDATE: Tambahkan icon X dan Timer
import { Circle, CheckCircle2, Trash2, Calendar, Loader2, Tag, AlignLeft, X, Timer } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
// ✅ UPDATE: Import fungsi action yang baru
import { deleteTask } from '@/app/actions/task-actions';
import { completeTaskWithInjection } from '@/app/actions/task-actions';
import { TaskDetailModal } from '@/components/tasks/task-detail-modal';
import { useRouter } from 'next/navigation';

export function TaskItem({ task, allLabels = [], allProjects = [] }: { task: any, allLabels?: any[], allProjects?: any[] }) {
    const router = useRouter(); // <--- 2. INISIALISASI ROUTER
    const [isCompleted, setIsCompleted] = useState(false); // <--- 3. STATE UNTUK HIDE INSTANT

    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ✅ STATE BARU UNTUK MICRO-PROMPT
    const [showPrompt, setShowPrompt] = useState(false);
    const [customTime, setCustomTime] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    // Mapping Visual
    const priorityConfig: Record<string, { color: string, icon: string, bg: string }> = {
        p1: { color: '#ef4444', icon: 'text-red-500', bg: 'bg-red-50/30' },
        p2: { color: '#f97316', icon: 'text-orange-500', bg: 'bg-orange-50/30' },
        p3: { color: '#3b82f6', icon: 'text-blue-500', bg: 'bg-blue-50/30' },
        p4: { color: 'transparent', icon: 'text-slate-300', bg: 'bg-white' },
    };

    const safePriority = (task.priority || 'p4').toLowerCase();
    const currentConfig = priorityConfig[safePriority] || priorityConfig.p4;

    // ✅ FUNGSI EKSEKUSI FINAL
    const handleComplete = async (duration: number) => {
        setIsUpdating(true);
        try {
            // Eksekusi ke database
            await completeTaskWithInjection(task.id, task.projectId, duration);

            // 1. Sembunyikan komponen secara instan dari layar pengguna
            setIsCompleted(true);

            // 2. Beritahu Next.js untuk memperbarui data server di background
            router.refresh();

        } catch (error) {
            console.error(error);
            setIsUpdating(false); // Hanya matikan loading jika terjadi error
        }
    };

    if (isCompleted) return null;

    return (
        <>
            <div
                className={`flex items-start gap-4 p-4 border-y border-r border-slate-100 rounded-xl shadow-sm transition-all duration-300 group border-l-4 ${currentConfig.bg} ${isDeleting || isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                style={{ borderLeftColor: currentConfig.color }}
            >
                {/* KONDISI 1: TAMPILAN PROMPT WAKTU (Jika checkbox di klik) */}
                {showPrompt ? (
                    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="flex items-center gap-2 text-slate-700">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            <span className="text-sm font-bold">Waktu dihabiskan?</span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {!showCustomInput ? (
                                <>
                                    {/* Opsi Cepat */}
                                    {[15, 30, 60].map(mins => (
                                        <button key={mins} onClick={() => handleComplete(mins)} className="bg-white border border-slate-200 hover:bg-purple-50 text-slate-600 hover:text-purple-700 hover:border-purple-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">
                                            {mins}m
                                        </button>
                                    ))}

                                    {/* Opsi Custom */}
                                    <button onClick={() => setShowCustomInput(true)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1">
                                        <Timer className="w-3.5 h-3.5" /> Custom
                                    </button>

                                    {/* Opsi Skip (Default 25m) */}
                                    <button onClick={() => handleComplete(25)} className="bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">
                                        Skip ⏭️
                                    </button>

                                    {/* Tombol Batal */}
                                    <button onClick={() => setShowPrompt(false)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors ml-1">
                                        <X className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                /* Input Mode Custom */
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                                    <input
                                        type="number"
                                        placeholder="Menit..."
                                        className="w-20 px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 shadow-sm"
                                        value={customTime}
                                        onChange={(e) => setCustomTime(e.target.value)}
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => handleComplete(Number(customTime) || 25)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 text-xs rounded-lg font-bold shadow-sm transition-colors"
                                    >
                                        Simpan
                                    </button>
                                    <button onClick={() => setShowCustomInput(false)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* KONDISI 2: TAMPILAN NORMAL TUGAS (Seperti aslinya) */
                    <>
                        <button
                            onClick={() => setShowPrompt(true)} // ✅ UPDATE: Ubah aksi klik menjadi memunculkan prompt
                            disabled={isUpdating}
                            className={`${currentConfig.icon} mt-0.5 hover:opacity-80 transition-colors`}
                        >
                            {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Circle className="w-5 h-5" />}
                        </button>

                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setIsModalOpen(true)}>
                            <h4 className="text-slate-700 font-semibold truncate leading-tight group-hover:text-purple-700 transition-colors">
                                {task.title}
                            </h4>

                            {task.description && (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 flex items-start gap-1.5">
                                    <AlignLeft className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-50" />
                                    <span>{task.description}</span>
                                </p>
                            )}

                            <div className="flex items-center flex-wrap gap-2 mt-2 text-[10px] font-bold uppercase tracking-wider">
                                {task.dueDate && (
                                    <span className="flex items-center gap-1 bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md shadow-sm">
                                        <Calendar className="w-3 h-3 text-purple-500" />
                                        {format(new Date(task.dueDate), 'd MMM yyyy', { locale: id })}
                                    </span>
                                )}
                                {task.labels?.map((labelName: string) => {
                                    const labelData = allLabels.find(l => l.name.toLowerCase() === labelName.toLowerCase());
                                    const labelColor = labelData?.color || '#8B5CF6';

                                    return (
                                        <span
                                            key={labelName}
                                            className="flex items-center gap-1 px-2 py-0.5 rounded-md border"
                                            style={{ backgroundColor: `${labelColor}10`, color: labelColor, borderColor: `${labelColor}30` }}
                                        >
                                            <Tag className="w-3 h-3" /> {labelName}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            onClick={async () => {
                                setIsDeleting(true);
                                await deleteTask(task.id);
                                setIsDeleting(false);
                            }}
                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>

            <TaskDetailModal
                task={task}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                allProjects={allProjects}
                allLabels={allLabels}
            />
        </>
    );
}