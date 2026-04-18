import { getCompletedTasks } from '@/app/actions/task-actions';
import { getActiveProjects } from '@/app/actions/project-actions';
import { getUserLabels } from '@/app/actions/label-actions';
import { ArchiveClient } from '@/components/archive/archive-client';

export const metadata = {
    title: 'Archive - Selesai.in',
};

export default async function ArchivePage() {
    // PERBAIKAN: Ambil data projects dan labels secara paralel
    const [completedTasks, projects, labels] = await Promise.all([
        getCompletedTasks(),
        getActiveProjects(),
        getUserLabels()
    ]);

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <ArchiveClient
                tasks={completedTasks}
                allProjects={projects} // <-- Lempar ke client
                allLabels={labels}     // <-- Lempar ke client
            />
        </div>
    );
}