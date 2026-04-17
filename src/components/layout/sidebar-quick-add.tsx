'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { GlobalQuickAddModal } from '@/components/tasks/global-quick-add-modal';
import { getActiveProjects } from '@/app/actions/project-actions';
import { getUserLabels } from '@/app/actions/label-actions';

export function SidebarQuickAdd() {
    const [isOpen, setIsOpen] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);
    const [labels, setLabels] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpen = async () => {
        setIsLoading(true);
        // Ambil data terbaru langsung dari server actions
        const [fetchedProjects, fetchedLabels] = await Promise.all([
            getActiveProjects(),
            getUserLabels()
        ]);

        setProjects(fetchedProjects);
        setLabels(fetchedLabels);
        setIsLoading(false);
        setIsOpen(true);
    };

    return (
        <>
            {/* Tombol yang muncul di Sidebar */}
            <button
                onClick={handleOpen}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3 px-4 font-bold transition-all shadow-lg shadow-purple-200 active:scale-95 disabled:opacity-70"
            >
                <Plus className="w-5 h-5" />
                {isLoading ? 'Memuat...' : 'Quick Add Task'}
            </button>

            {/* Render Modal (Hanya muncul jika isOpen true) */}
            <GlobalQuickAddModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                allProjects={projects}
                allLabels={labels}
            />
        </>
    );
}