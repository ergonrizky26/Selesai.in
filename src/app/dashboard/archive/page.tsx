import { getCompletedTasks } from '@/app/actions/task-actions';
import { ArchiveClient } from '@/components/archive/archive-client';

export const metadata = {
    title: 'Archive - Selesai.in',
};

export default async function ArchivePage() {
    const completedTasks = await getCompletedTasks();

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <ArchiveClient tasks={completedTasks} />
        </div>
    );
}