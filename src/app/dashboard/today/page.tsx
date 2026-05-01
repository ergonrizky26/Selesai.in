import { getTodayTasks } from '@/app/actions/task-actions';
import { TaskList } from '@/components/tasks/task-list';
import { QuickAdd } from '@/components/tasks/quick-add';
import { format, isBefore, startOfToday } from 'date-fns';
import { id } from 'date-fns/locale';

export const metadata = {
    title: 'Today | Selesai.in',
};

export default async function TodayPage() {
    const tasks = await getTodayTasks();
    const todayDate = format(new Date(), 'EEEE, d MMMM yyyy', { locale: id });

    // ✅ PISAHKAN TUGAS: Overdue vs Hari Ini
    // Asumsi: Semua tugas yang statusnya bukan 'done' sudah difilter oleh getTodayTasks
    const overdueTasks = tasks.filter((t: any) => t.dueDate && isBefore(new Date(t.dueDate), startOfToday()));

    // Tugas hari ini adalah sisa dari yang bukan overdue (atau tidak punya tanggal spesifik namun masuk list Today)
    const todayTasks = tasks.filter((t: any) => !t.dueDate || !isBefore(new Date(t.dueDate), startOfToday()));

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="space-y-1">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Today.</h2>
                <p className="text-slate-500">{todayDate}</p>
            </div>

            <section>
                <QuickAdd />
            </section>

            <section className="space-y-6">
                {/* ✅ SEKSI OVERDUE */}
                {overdueTasks.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-red-100 pb-2">
                            <h3 className="text-sm font-extrabold text-red-600 uppercase tracking-widest">Terlewat</h3>
                            <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {overdueTasks.length}
                            </span>
                        </div>
                        <TaskList tasks={overdueTasks} emptyMessage="" />
                    </div>
                )}

                {/* ✅ SEKSI HARI INI */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mt-4">
                        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">Hari Ini</h3>
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {todayTasks.length}
                        </span>
                    </div>
                    <TaskList tasks={todayTasks} emptyMessage="Tidak ada tugas untuk hari ini. Nikmati hari Anda!" />
                </div>
            </section>
        </div>
    );
}