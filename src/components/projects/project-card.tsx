import { Folder, MoreVertical, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
    project: {
        id: string;
        name: string;
        color: string | null;
        activeTasks: number;
        completedTasks: number;
    };
}

export function ProjectCard({ project }: ProjectCardProps) {
    const safeColor = project.color || '#8B5CF6';
    const total = project.activeTasks + project.completedTasks;
    const progress = total > 0 ? Math.round((project.completedTasks / total) * 100) : 0;

    return (
        <Link href={`/dashboard/projects/${project.id}`}>
            <div className="bg-white p-6 rounded-[2rem] border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-300 transition-all group relative overflow-hidden cursor-pointer">
                <div className="flex justify-between items-start mb-6">
                    <div
                        className="p-3 rounded-2xl"
                        style={{ backgroundColor: `${safeColor}15`, color: safeColor }}
                    >
                        <Folder className="w-6 h-6 fill-current opacity-20" />
                        <Folder className="w-6 h-6 absolute" />
                    </div>
                    <button className="text-slate-300 hover:text-slate-600 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                            {project.name}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">{project.activeTasks} tugas aktif</p>
                    </div>

                    {/* Progress Mini Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full transition-all duration-1000"
                                style={{ width: `${progress}%`, backgroundColor: safeColor }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {project.completedTasks}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            {project.activeTasks}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}