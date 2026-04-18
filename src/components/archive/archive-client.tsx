'use client';

import { useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, isToday, isYesterday } from 'date-fns';
import { id } from 'date-fns/locale';
import { TaskDetailModal } from '@/components/tasks/task-detail-modal';
import { cn } from '@/lib/utils';

export function ArchiveClient({ tasks }: { tasks: any[] }) {
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fungsi Pengelompokan Tugas berdasarkan Tanggal
    const groupedTasks = tasks.reduce((acc: any, task: any) => {
        // Kita gunakan updatedAt karena itu waktu tugas diselesaikan
        const date = new Date(task.updatedAt);
        const dateStr = format(date, 'yyyy-MM-dd');

        if (!acc[dateStr]) {
            acc[dateStr] = [];
        }
        acc[dateStr].push(task);
        return acc;
    }, {});

    // Mengurutkan tanggal dari yang terbaru
    const sortedDates = Object.keys(groupedTasks).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Helper untuk memformat judul grup tanggal (Misal: 18 Oct • Today • Friday)
    const formatGroupHeader = (dateStr: string) => {
        const date = new Date(dateStr);
        const dayAndMonth = format(date, 'd MMM');
        const dayOfWeek = format(date, 'EEEE', { locale: id }); // Bisa ganti ke bahasa inggris jika mau

        let relativeDay = '';
        if (isToday(date)) relativeDay = ' • Hari Ini';
        else if (isYesterday(date)) relativeDay = ' • Kemarin';

        return `${dayAndMonth}${relativeDay} • ${dayOfWeek}`;
    };

    // Fungsi Export ke CSV
    const handleExport = () => {
        if (tasks.length === 0) return;

        // Header CSV
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID,Judul,Deskripsi,Prioritas,Tanggal Selesai\n";

        // Isi Baris CSV
        tasks.forEach(task => {
            const row = [
                task.id,
                `"${task.title.replace(/"/g, '""')}"`, // Handle karakter koma/kutip
                `"${(task.description || '').replace(/"/g, '""')}"`,
                task.priority || 'P4',
                format(new Date(task.updatedAt), 'yyyy-MM-dd HH:mm:ss')
            ];
            csvContent += row.join(",") + "\n";
        });

        // Trigger Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `archive_tasks_${format(new Date(), 'yyyyMMdd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-10">

            {/* HEADER ARCHIVE */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Archive</h2>
                    <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span>{tasks.length.toLocaleString()} tugas berhasil diselesaikan</span>
                    </div>
                </div>

                <Button
                    onClick={handleExport}
                    className="bg-[#41F0D0] hover:bg-[#20dfbf] text-teal-950 font-bold rounded-full h-12 px-6 shadow-sm transition-all active:scale-95 flex items-center gap-2"
                >
                    <Download className="w-4 h-4" /> Export Tasks
                </Button>
            </div>

            {/* DAFTAR TUGAS PER TANGGAL */}
            <div className="space-y-10">
                {sortedDates.map(dateStr => {
                    const dayTasks = groupedTasks[dateStr];

                    return (
                        <div key={dateStr} className="space-y-4">

                            {/* Header Tanggal */}
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-slate-900">
                                    {formatGroupHeader(dateStr)}
                                </h3>
                                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">
                                    {dayTasks.length} tugas selesai
                                </span>
                            </div>

                            {/* Grid Tasks */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dayTasks.map((task: any) => (
                                    <div
                                        key={task.id}
                                        onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                                        className="bg-white border border-slate-100 p-5 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow cursor-pointer flex gap-4"
                                    >
                                        <div className="mt-1 shrink-0">
                                            <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-200">
                                                <CheckCircle2 className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[15px] font-bold text-slate-900 truncate">{task.title}</h4>
                                            <p className="text-xs text-slate-400 mt-1 mb-3">
                                                Selesai pada {format(new Date(task.updatedAt), 'hh:mm a')}
                                            </p>

                                            {/* Labels / Tags Dummy sesuai Screenshot (Bisa diganti dengan data label asli jika Anda simpan label di dalam tabel tasks) */}
                                            <div className="flex gap-2 flex-wrap">
                                                {task.labels && task.labels.length > 0 ? (
                                                    task.labels.map((label: string) => (
                                                        <span key={label} className="text-[9px] font-bold px-2 py-1 bg-purple-50 text-purple-600 rounded-md uppercase tracking-wider">
                                                            {label}
                                                        </span>
                                                    ))
                                                ) : (
                                                    // Fallback jika tidak ada label
                                                    <span className="text-[9px] font-bold px-2 py-1 bg-slate-50 text-slate-400 rounded-md uppercase tracking-wider">
                                                        NO LABEL
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    );
                })}

                {tasks.length === 0 && (
                    <p className="text-slate-400 text-center py-10">Belum ada tugas yang diselesaikan.</p>
                )}
            </div>

            {/* Modal Detail (Read Only) */}
            <TaskDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={selectedTask}
                readOnly={true} // <-- MODE BACA-SAJA AKTIF
            />

        </div>
    );
}