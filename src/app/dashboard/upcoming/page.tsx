import { getUpcomingTasks } from '@/app/actions/task-actions';
import { TaskList } from '@/components/tasks/task-list';

export const metadata = {
    title: 'Upcoming | Selesai.in',
};

export default async function UpcomingPage() {
    const tasks = await getUpcomingTasks();

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="space-y-1">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Upcoming.</h2>
                <p className="text-slate-500">Pandangan ke depan untuk menjaga ketenangan pikiran Anda.</p>
            </div>

            <section className="space-y-4 mt-8">
                <TaskList tasks={tasks} emptyMessage="Tidak ada tugas mendatang yang dijadwalkan." />
            </section>
        </div>
    );
}