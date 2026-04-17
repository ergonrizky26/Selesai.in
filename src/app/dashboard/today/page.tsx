import { getTodayTasks } from '@/app/actions/task-actions';
import { TaskList } from '@/components/tasks/task-list';
import { QuickAdd } from '@/components/tasks/quick-add';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const metadata = {
    title: 'Today | Selesai.in',
};

export default async function TodayPage() {
    const tasks = await getTodayTasks();
    const todayDate = format(new Date(), 'EEEE, d MMMM yyyy', { locale: id });

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="space-y-1">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Today.</h2>
                <p className="text-slate-500">{todayDate}</p>
            </div>

            <section>
                <QuickAdd />
            </section>

            <section className="space-y-4">
                <TaskList tasks={tasks} emptyMessage="Tidak ada tugas untuk hari ini. Nikmati hari Anda!" />
            </section>
        </div>
    );
}