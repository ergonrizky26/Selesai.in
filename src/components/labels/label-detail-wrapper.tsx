'use client';

import { useState } from 'react';
import { Tag, Star } from 'lucide-react';
import { LabelDetailModal } from '@/components/labels/label-detail-modal';

interface LabelDetailWrapperProps {
    initialLabels: any[];
    allProjects: any[];
}

export function LabelDetailWrapper({ initialLabels = [], allProjects = [] }: LabelDetailWrapperProps) {
    const [selectedLabel, setSelectedLabel] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = (label: any) => {
        setSelectedLabel(label);
        setIsModalOpen(true);
    };

    return (
        <>
            {/* Grid Kartu Label */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                {initialLabels.length === 0 ? (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                        <p className="text-slate-400">Belum ada label manual. Tambahkan satu untuk memulai!</p>
                    </div>
                ) : (
                    initialLabels.map((label) => (
                        <div
                            key={label.id}
                            onClick={() => handleOpenModal(label)}
                            className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md hover:border-purple-200 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                                    style={{ backgroundColor: `${label.color}15`, color: label.color || '#8B5CF6' }}
                                >
                                    <Tag className="w-5 h-5 fill-current opacity-30" />
                                    <Tag className="w-5 h-5 absolute" />
                                </div>
                                <div>
                                    <span className="font-bold text-slate-700 group-hover:text-purple-600 transition-colors capitalize">
                                        {label.name}
                                    </span>
                                    {label.isFavorite && (
                                        <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase mt-0.5">
                                            <Star className="w-2.5 h-2.5 fill-current" /> Favorit
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Render Modal Detail Label */}
            {selectedLabel && (
                <LabelDetailModal
                    label={selectedLabel}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    allProjects={allProjects}
                    allLabels={initialLabels}
                />
            )}
        </>
    );
}