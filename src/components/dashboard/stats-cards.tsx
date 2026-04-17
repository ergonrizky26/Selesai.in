import { Zap, Target } from 'lucide-react';

interface StatsProps {
    streak: number;
    progress: number;
}

export function StatsCards({ streak, progress }: StatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Streak Card */}
            <div className="bg-white p-6 rounded-[2rem] border border-purple-100 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                        <Zap className="w-6 h-6 fill-current" />
                    </div>
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Streak</span>
                </div>
                <div className="space-y-1">
                    <h3 className="text-4xl font-bold text-slate-900">{streak} <span className="text-lg font-medium text-slate-400">Hari</span></h3>
                    <p className="text-sm text-slate-500">Anda sedang fokus. Pertahankan!</p>
                </div>
                <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full w-[60%] transition-all duration-1000"></div>
                </div>
            </div>

            {/* Progress Card */}
            <div className="bg-white p-6 rounded-[2rem] border border-emerald-50 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                        <Target className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Progress</span>
                </div>
                <div className="space-y-1">
                    <h3 className="text-4xl font-bold text-slate-900">{progress}% <span className="text-lg font-medium text-slate-400">Selesai</span></h3>
                    <p className="text-sm text-slate-500">Hebat! Selesaikan sisa tugas Anda hari ini.</p>
                </div>
                <div className="mt-4 h-2 w-full bg-slate-100 rounded-full flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className={`h-full flex-1 rounded-full transition-all duration-1000 ${i < (progress / 20) ? 'bg-emerald-500' : 'bg-slate-100'
                                }`}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
}