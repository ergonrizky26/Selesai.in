'use client';

import { useState } from 'react';
import { Circle, CheckCircle2, Trash2, Calendar, Loader2, Tag, AlignLeft } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { completeTask, deleteTask } from '@/app/actions/task-actions';
import { TaskDetailModal } from '@/components/tasks/task-detail-modal';

export function TaskItem({ task, allLabels = [], allProjects = [] }: { task: any, allLabels?: any[], allProjects?: any[] }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // <--- 2. State Modal

    // Mapping Visual: Menggunakan Hex Color untuk Inline Style agar 100% akurat
    const priorityConfig: Record<string, { color: string, icon: string, bg: string }> = {
        p1: { color: '#ef4444', icon: 'text-red-500', bg: 'bg-red-50/30' },
        p2: { color: '#f97316', icon: 'text-orange-500', bg: 'bg-orange-50/30' },
        p3: { color: '#3b82f6', icon: 'text-blue-500', bg: 'bg-blue-50/30' },
        p4: { color: 'transparent', icon: 'text-slate-300', bg: 'bg-white' },
    };

    // Pastikan data priority selalu terbaca huruf kecil, fallback ke p4
    const safePriority = (task.priority || 'p4').toLowerCase();
    const currentConfig = priorityConfig[safePriority] || priorityConfig.p4;

    return (
        <>
            <div
                className={`flex items-start gap-4 p-4 border-y border-r border-slate-100 rounded-xl shadow-sm transition-all group border-l-4 ${currentConfig.bg} ${isDeleting ? 'opacity-50' : ''}`}
                style={{ borderLeftColor: currentConfig.color }} // <--- PAKSA WARNA MUNCUL DI SINI
            >

                {/* Checkbox dengan warna prioritas */}
                <button
                    onClick={() => completeTask(task.id)}
                    disabled={isUpdating}
                    className={`${currentConfig.icon} mt-0.5 hover:opacity-80 transition-colors`}
                >
                    {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Circle className="w-5 h-5" />}
                </button>

                <div className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setIsModalOpen(true)} // Buka modal saat teks di klik
                >
                    <h4 className="text-slate-700 font-semibold truncate leading-tight group-hover:text-purple-700 transition-colors">
                        {task.title}
                    </h4>

                    {/* Tampilkan Deskripsi */}
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
                        {/* Render Label */}
                        {task.labels?.map((labelName: string) => {
                            // Cari data warna dari 'allLabels' berdasarkan nama
                            const labelData = allLabels.find(l => l.name.toLowerCase() === labelName.toLowerCase());
                            const labelColor = labelData?.color || '#8B5CF6';

                            return (
                                <span
                                    key={labelName}
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-md border"
                                    style={{
                                        backgroundColor: `${labelColor}10`,
                                        color: labelColor,
                                        borderColor: `${labelColor}30`
                                    }}
                                >
                                    <Tag className="w-3 h-3" /> {labelName}
                                </span>
                            );
                        })}
                    </div>
                </div>

                <button
                    onClick={() => deleteTask(task.id)}
                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* 4. Render Komponen Modal */}
            <TaskDetailModal
                task={task}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                allProjects={allProjects} // <--- Kirim data proyek
                allLabels={allLabels}     // <--- Kirim data label
            />
        </>
    );
}