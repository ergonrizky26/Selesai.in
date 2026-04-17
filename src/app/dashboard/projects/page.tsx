import { getDetailedProjects } from '@/app/actions/project-actions';
import { ProjectCard } from '@/components/projects/project-card';
import { Plus, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateProjectButton } from '@/components/projects/create-project-button';

export const metadata = {
    title: 'Projects | Selesai.in',
};

export default async function ProjectsPage() {
    const projects = await getDetailedProjects();

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Projects.</h2>
                    <p className="text-slate-500">Kelola fokus berdasarkan kategori dan tujuan besar Anda.</p>
                </div>
                {/* <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-12 px-6 font-bold shadow-lg shadow-purple-100">
                    <Plus className="w-5 h-5 mr-2" />
                    Proyek Baru
                </Button> */}
                {/* INJEKSI TOMBOL DI SINI */}
                <CreateProjectButton />
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-purple-100 rounded-[2.5rem] bg-purple-50/30">
                    <LayoutGrid className="w-12 h-12 text-purple-200 mb-4" />
                    <p className="text-slate-500">Belum ada proyek aktif.</p>
                    <p className="text-sm text-slate-400 mt-1">Gunakan #namaproyek saat menambah tugas baru!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}
        </div>
    );
}