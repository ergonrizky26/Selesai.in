export function AnalyticsCircle({ progress }: { progress: number }) {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="bg-white p-8 rounded-[2rem] border border-purple-100 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Sanctuary Analytics</h3>
            <div className="relative flex items-center justify-center">
                <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                        cx="96"
                        cy="96"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-slate-100"
                    />
                    <circle
                        cx="96"
                        cy="96"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={circumference}
                        style={{ strokeDashoffset: offset }}
                        className="text-purple-600 transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900">{progress}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Focus</span>
                </div>
            </div>
            <p className="mt-6 text-[11px] text-slate-400 italic text-center leading-relaxed">
                "Flow is the result of focused intention."
            </p>
        </div>
    );
}