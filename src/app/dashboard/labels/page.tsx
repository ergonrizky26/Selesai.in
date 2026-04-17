import { getUserLabels } from '@/app/actions/label-actions';
import { CreateLabelModal } from '@/components/labels/create-label-modal';
import { Tag, Star } from 'lucide-react';
import { getActiveProjects } from '@/app/actions/project-actions';
import { LabelDetailWrapper } from '@/components/labels/label-detail-wrapper';

export default async function LabelsPage() {
    const [labels, projects] = await Promise.all([
        getUserLabels(),
        getActiveProjects()
    ]);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex items-end justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Labels.</h2>
                    <p className="text-slate-500">Kustomisasi kategori untuk alur kerja yang lebih personal.</p>
                </div>
                <CreateLabelModal />
            </div>

            {/* Gunakan Client Component untuk menangani klik dan modal */}
            <LabelDetailWrapper
                initialLabels={labels}
                allProjects={projects}
            />

            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                {labels.length === 0 ? (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                        <p className="text-slate-400">Belum ada label manual. Tambahkan satu untuk memulai!</p>
                    </div>
                ) : (
                    labels.map((label) => (
                        <div
                            key={label.id}
                            className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${label.color}15`, color: label.color || '#8B5CF6' }}
                                >
                                    <Tag className="w-5 h-5 fill-current opacity-30" />
                                    <Tag className="w-5 h-5 absolute" />
                                </div>
                                <div>
                                    <span className="font-bold text-slate-700 group-hover:text-purple-600 transition-colors">
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
            </div> */}
        </div>
    );
}