import { getTasksByProject, getProjectById } from '@/app/actions/task-actions';
import { TaskList } from '@/components/tasks/task-list';
import { QuickAdd } from '@/components/tasks/quick-add';
import { ChevronLeft, Folder } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// PERBAIKAN 1: Definisikan params sebagai Promise
export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // PERBAIKAN 2: Tunggu (await) params diekstrak sebelum mengambil nilainya
    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    // Validasi keamanan: Jika tidak ada ID di URL, lemparkan ke halaman 404
    if (!projectId) {
        notFound();
    }

    // Ambil data project dan tugas secara paralel menggunakan projectId yang sudah valid
    const [project, tasks] = await Promise.all([
        getProjectById(projectId),
        getTasksByProject(projectId)
    ]);

    if (!project) {
        notFound();
    }

    const safeColor = project.color || '#8B5CF6';

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Breadcrumb & Back Button */}
            <Link
                href="/dashboard/projects"
                className="flex items-center text-sm font-medium text-slate-500 hover:text-purple-600 transition-colors group"
            >
                <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                Kembali ke Semua Proyek
            </Link>

            {/* Project Header */}
            <div className="flex items-center gap-4">
                <div
                    className="p-4 rounded-3xl"
                    style={{ backgroundColor: `${safeColor}10`, color: safeColor }}
                >
                    <Folder className="w-8 h-8 fill-current opacity-20" />
                    <Folder className="w-8 h-8 absolute" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{project.name}</h2>
                    <p className="text-slate-500">{tasks.length} tugas yang perlu diselesaikan</p>
                </div>
            </div>

            {/* Input khusus untuk proyek ini */}
            <section>
                <div className="mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Tambah tugas ke proyek ini
                </div>
                <QuickAdd />
            </section>

            {/* Daftar Tugas Terfilter */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Tugas Proyek</h3>
                <TaskList tasks={tasks} emptyMessage="Semua tugas di proyek ini sudah selesai. Luar biasa!" />
            </section>
        </div>
    );
}