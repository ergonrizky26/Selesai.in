'use client';

import { useState, useEffect } from 'react';
import { Plus, Circle, CheckCircle2, Inbox as InboxIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createTask, completeTask } from '@/app/actions/task-actions';
import { cn } from '@/lib/utils';
import { TaskDetailModal } from '@/components/tasks/task-detail-modal';
import { useRouter } from 'next/navigation'; // ✅ TAMBAHKAN INI

export function InboxClient({
    initialTasks,
    allProjects = [],
    allLabels = []
}: {
    initialTasks: any[],
    allProjects?: any[],
    allLabels?: any[]
}) {
    const router = useRouter(); // ✅ INISIALISASI ROUTER
    const [tasks, setTasks] = useState(initialTasks);

    // ✅ UPDATE 2: Sinkronisasi State dengan Props
    // Setiap kali data dari server (initialTasks) berubah, update state 'tasks'
    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // ✅ UPDATE: FILTER HANYA TUGAS YANG BELUM SELESAI (TODO)
    const activeTasks = tasks.filter(task => task.status !== 'done');

    // ✅ UPDATE: FUNGSI SOUND EFFECT (Dari Todoist)
    const playDoneSound = () => {
        const doneSound = new Audio('/sounds/done-click.mp3');
        doneSound.volume = 0.3;
        doneSound.play().catch(e => console.log('Audio blocked by browser', e));
    };

    // Fungsi Toggle Status Selesai
    const handleToggleTask = async (e: React.MouseEvent, taskId: string, currentStatus: string) => {
        e.stopPropagation();
        if (currentStatus === 'done') return;

        // 1. Mainkan Suara "Ting"
        playDoneSound();

        // 2. Hilangkan dari UI Instan (Optimistic Update)
        setTasks(tasks.filter(t => t.id !== taskId));

        // 3. Eksekusi ke Database di Background
        await completeTask(taskId);

        // 4. Sinkronisasi data server
        router.refresh();
    };

    // Fungsi Submit Tugas Baru
    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        setIsSubmitting(true);
        await createTask({ title: newTaskTitle });

        setNewTaskTitle('');
        setIsSubmitting(false);
        setIsAddModalOpen(false);
        router.refresh(); // ✅ UPDATE: Ganti window.location.reload() jadi router.refresh() agar lebih halus (SPA)
    };

    // Fungsi Buka Detail
    const openTaskDetail = (task: any) => {
        setSelectedTask(task);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="space-y-6">

            {/* HEADER & ADD BUTTON */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Inbox.</h2>
                    <p className="text-slate-500 text-sm font-medium">Semua tugas dan ide Anda bermuara di sini.</p>
                </div>

                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-[#6c2bd9] hover:bg-[#5b21b6] text-white font-bold rounded-full h-12 px-8 shadow-xl shadow-purple-200 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest text-xs"
                >
                    <Plus className="w-4 h-4" /> Quick Add Task
                </Button>
            </div>

            {/* TASK LIST */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-2">
                {/* ✅ UPDATE: Gunakan 'activeTasks' bukan 'tasks' biasa */}
                {activeTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">Inbox Kosong</h3>
                        <p className="text-slate-400 text-sm mt-1 max-w-xs">Bagus sekali! Anda telah menyelesaikan semua hal.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {/* ✅ UPDATE: Gunakan 'activeTasks' untuk di-loop */}
                        {activeTasks.map((task) => (
                            <div
                                key={task.id}
                                onClick={() => openTaskDetail(task)}
                                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors rounded-2xl group cursor-pointer"
                            >
                                <button
                                    onClick={(e) => handleToggleTask(e, task.id, task.status)}
                                    className="text-slate-300 hover:text-purple-500 transition-colors shrink-0 z-10"
                                >
                                    <Circle className="w-6 h-6" />
                                </button>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-slate-700 truncate transition-all">
                                        {task.title}
                                    </h4>
                                </div>

                                <div className="shrink-0 flex items-center gap-2">
                                    <span className={cn(
                                        "text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider",
                                        task.priority === 'p1' ? "bg-red-50 text-red-600" :
                                            task.priority === 'p2' ? "bg-orange-50 text-orange-600" :
                                                "bg-slate-100 text-slate-500"
                                    )}>
                                        {task.priority || 'P4'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL 1: ADD TASK */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[500px] p-8 rounded-[2.5rem] border-none shadow-2xl">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-2xl font-extrabold text-slate-900">Tugas Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateTask} className="space-y-6">
                        <Input
                            autoFocus
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Apa yang ingin Anda kerjakan?"
                            className="text-lg h-14 bg-slate-50 border-none rounded-2xl px-5 font-medium placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-purple-200"
                            disabled={isSubmitting}
                        />
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="font-bold text-slate-500 rounded-xl">Batal</Button>
                            <Button type="submit" disabled={!newTaskTitle.trim() || isSubmitting} className="bg-[#6c2bd9] hover:bg-[#5b21b6] text-white font-bold rounded-xl px-6">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Simpan Tugas'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL 2: DETAIL TUGAS */}
            <TaskDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                task={selectedTask}
                allProjects={allProjects}
                allLabels={allLabels}
            />
        </div>
    );
}