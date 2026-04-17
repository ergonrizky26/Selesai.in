'use client'; // <-- Tambahkan ini karena kita butuh interaksi state

import { useState } from 'react';
import { Folder, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CreateProjectModal } from '@/components/projects/create-project-modal'; // <-- Import Modal Fase 19

interface ProjectListProps {
    projects: any[];
}

export function ProjectList({ projects }: ProjectListProps) {
    // State untuk mengontrol Modal Create Project
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 1. Kalkulasi progres
    const projectsWithProgress = projects.map(project => {
        const total = project.taskCount || 0;
        const completed = project.completedCount || 0;
        const remaining = project.remainingCount || 0;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { ...project, total, completed, remaining, progress };
    });

    // 2. Urutkan berdasarkan progress tertinggi
    const sortedProjects = projectsWithProgress.sort((a, b) => b.progress - a.progress);

    // 3. Batasi hanya 3 proyek teratas
    const topProjects = sortedProjects.slice(0, 3);

    return (
        <>
            <div className="bg-white p-6 rounded-[2rem] border border-purple-50/50 shadow-sm flex flex-col h-fit">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                        Active Projects
                    </h3>
                    {/* PERBAIKAN: Ubah Link menjadi Button yang membuka Modal */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-purple-400 hover:text-purple-600 transition-colors bg-purple-50 hover:bg-purple-100 p-1 rounded-lg"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {/* List Proyek Teratas (Maksimal 3) */}
                <div className="space-y-6">
                    {topProjects.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">Belum ada proyek.</p>
                    ) : (
                        topProjects.map((project) => {
                            const projectColor = project.color || '#8b5cf6';

                            return (
                                <div key={project.id} className="group flex flex-col">
                                    {/* Baris Atas */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-11 h-11 rounded-[1rem] flex items-center justify-center transition-transform group-hover:scale-105 shrink-0"
                                                style={{ backgroundColor: `${projectColor}15`, color: projectColor }}
                                            >
                                                <Folder className="w-5 h-5" />
                                            </div>
                                            <span className="font-semibold text-slate-700 text-sm truncate">
                                                {project.name}
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 text-slate-500 text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full shrink-0">
                                            {project.remaining}
                                        </div>
                                    </div>

                                    {/* Baris Bawah: Wording & Progress Bar */}
                                    <div className="pl-[3.75rem] pr-1 space-y-1.5 -mt-0.5">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                            <span className="text-slate-400">
                                                {project.total === 0
                                                    ? 'Belum ada tugas'
                                                    : project.remaining > 0
                                                        ? `${project.remaining} tugas tersisa`
                                                        : 'Semua Tuntas! 🎉'}
                                            </span>
                                            <span style={{ color: projectColor }}>{project.progress}%</span>
                                        </div>

                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${project.progress}%`, backgroundColor: projectColor }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Link: View all projects */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                    <Link
                        href="/dashboard/projects"
                        className="flex items-center justify-center gap-2 text-[11px] font-bold text-purple-600 hover:text-purple-800 transition-colors uppercase tracking-[0.15em] group"
                    >
                        View all projects
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

            </div>

            {/* INJEKSI MODAL */}
            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}