import { Folder } from 'lucide-react';

interface ProjectListProps {
    projects: any[];
}

export function ProjectList({ projects }: ProjectListProps) {
    if (projects.length === 0) {
        return (
            <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2rem] text-center bg-slate-50/50">
                <p className="text-slate-400 font-medium">Belum ada proyek aktif.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => {
                const total = project.taskCount || 0;
                const completed = project.completedCount || 0;
                const remaining = project.remainingCount || 0;

                // Kalkulasi persentase, pastikan tidak dibagi 0
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                const projectColor = project.color || '#8b5cf6'; // Default ke ungu jika tidak ada warna

                return (
                    <div
                        key={project.id}
                        className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group flex flex-col"
                    >
                        {/* Header Proyek */}
                        <div className="flex items-center gap-3 mb-6">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0"
                                style={{ backgroundColor: `${projectColor}15`, color: projectColor }}
                            >
                                <Folder className="w-5 h-5 fill-current opacity-20 absolute" />
                                <Folder className="w-5 h-5 relative z-10" />
                            </div>
                            <h4 className="font-bold text-slate-700 truncate text-lg">{project.name}</h4>
                        </div>

                        {/* Bagian Progress Bar & Wording */}
                        <div className="mt-auto space-y-2.5">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-slate-500 tracking-wide">
                                    {total === 0
                                        ? 'Kosong'
                                        : remaining > 0
                                            ? `${remaining} tugas tersisa`
                                            : 'Semua tuntas! 🎉'}
                                </span>
                                <span className="text-sm font-extrabold" style={{ color: projectColor }}>
                                    {progress}%
                                </span>
                            </div>

                            {/* Track Background */}
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                {/* Fill Progress Bar */}
                                <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                        width: `${progress}%`,
                                        backgroundColor: projectColor
                                    }}
                                />
                            </div>
                        </div>

                    </div>
                );
            })}
        </div>
    );
}