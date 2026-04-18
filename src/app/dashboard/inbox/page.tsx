import { getAllTasks } from '@/app/actions/task-actions';
import { getActiveProjects } from '@/app/actions/project-actions'; // Asumsi sudah ada
import { getUserLabels } from '@/app/actions/label-actions'; // <-- IMPORT BARU
import { InboxClient } from '@/components/inbox/inbox-client';

export const metadata = {
    title: 'Inbox - Selesai.in',
};

export default async function InboxPage() {
    // Ambil semua data secara paralel dari server
    const [tasks, projects, labels] = await Promise.all([
        getAllTasks(),
        getActiveProjects(), // Pastikan nama fungsinya sesuai dengan yang ada di project-actions.ts
        getUserLabels()      // Mengambil label asli dari database
    ]);

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <InboxClient
                initialTasks={tasks}
                allProjects={projects}
                allLabels={labels} // <-- MENGGUNAKAN DATA ASLI
            />
        </div>
    );
}