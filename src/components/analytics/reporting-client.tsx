'use client';

import { useState, cloneElement, useEffect } from 'react';
import { LineChart, Line, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, Cell as BarCell } from 'recharts';
import { ActivityCalendar } from 'react-activity-calendar';
import { Clock, Zap, Target, Download, FileText, Table as TableIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { getAnalyticsData, updateFocusGoal } from '@/app/actions/analytics-actions';
import { jsPDF } from 'jspdf';

// ✅ UPDATE 1: Ganti html2canvas dengan html-to-image
import { toPng } from 'html-to-image';

// Komponen Custom Tooltip untuk Radar Chart
const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl">
                <p className="text-white font-bold text-xs mb-1 uppercase tracking-wider">
                    {payload[0].payload.subject}
                </p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <p className="text-purple-300 text-sm font-semibold">
                        {payload[0].value} <span className="text-xs font-normal text-slate-400">menit</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export function ReportingClient({ initialData }: { initialData: any }) {
    const [filter, setFilter] = useState('7 days');
    const [data, setData] = useState(initialData);
    const [isFetching, setIsFetching] = useState(false);
    const [customDates, setCustomDates] = useState({ from: '', to: '' });

    // STATE GOAL: Ambil default dari database
    const [goalHours, setGoalHours] = useState(initialData.stats.userGoal);
    const [isSavingGoal, setIsSavingGoal] = useState(false);

    // EFEK AUTO-SAVE
    useEffect(() => {
        if (goalHours === data.stats.userGoal) return;

        const timeoutId = setTimeout(async () => {
            setIsSavingGoal(true);
            await updateFocusGoal(goalHours);
            setIsSavingGoal(false);
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [goalHours, data.stats.userGoal]);

    // Fungsi Panggil Backend
    const fetchData = async (days: number, from?: string, to?: string) => {
        setIsFetching(true);
        try {
            const res = await getAnalyticsData(days, from, to);
            setData(res);
        } catch (error) {
            console.error("Gagal menarik data", error);
        }
        setIsFetching(false);
    };

    const handleFilterChange = (f: string) => {
        setFilter(f);
        if (f === '7 days') fetchData(7);
        if (f === '30 days') fetchData(30);
    };

    const handleCustomApply = () => {
        if (customDates.from && customDates.to) {
            fetchData(0, customDates.from, customDates.to);
        }
    };

    // --- FUNGSI EXPORT CSV ---
    const exportToCSV = () => {
        const headers = ["Date,Duration (Min),Project,Task"];
        const rows = data.exportData.map((s: any) =>
            `${s.date},${s.duration},"${s.project}","${s.task}"`
        );

        const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `SelesaiIn_Report_${filter.replace(' ', '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ✅ UPDATE 2: FUNGSI EXPORT PDF MULTI-PAGE & ANTI-OKLAB BUG
    const exportToPDF = async () => {
        setIsFetching(true);
        const element = document.getElementById('report-content');
        if (!element) {
            setIsFetching(false);
            return;
        }

        try {
            const dataUrl = await toPng(element, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: '#fafafa',
                style: { transform: 'scale(1)', transformOrigin: 'top left' } // Mencegah grafik recharts menghilang
            });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgProps = pdf.getImageProperties(dataUrl);
            const imgHeightInMm = (imgProps.height * pdfWidth) / imgProps.width;

            let heightLeft = imgHeightInMm;
            let position = 0;

            // Render Halaman 1
            pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeightInMm);
            heightLeft -= pdfHeight;

            // Render Halaman 2, 3, dst jika kontennya panjang
            while (heightLeft > 0) {
                position = heightLeft - imgHeightInMm;
                pdf.addPage();
                pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeightInMm);
                heightLeft -= pdfHeight;
            }

            pdf.save(`SelesaiIn_Analysis_${filter.replace(' ', '_')}.pdf`);
        } catch (error) {
            console.error("Gagal export ke PDF:", error);
            alert("Terjadi kesalahan saat memproses PDF.");
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <div className="space-y-6">

            {/* HEADER & FILTER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-purple-700 tracking-tight">Performance Insights</h2>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                    {/* TOMBOL EXPORT */}
                    <div className="flex gap-2">
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <TableIcon className="w-3.5 h-3.5" />
                            CSV
                        </button>
                        <button
                            onClick={exportToPDF}
                            className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-sm shadow-slate-200"
                        >
                            <Download className="w-3.5 h-3.5" />
                            PDF Report
                        </button>
                    </div>

                    <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

                    {/* BAGIAN FILTER KANAN ATAS */}
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex bg-white rounded-full p-1 border border-slate-100 shadow-sm">
                            {['7 days', '30 days', 'Custom'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => handleFilterChange(f)}
                                    className={cn(
                                        "px-5 py-1.5 text-xs font-bold rounded-full transition-all",
                                        filter === f ? "bg-white text-purple-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* INPUT TANGGAL MUNCUL JIKA "CUSTOM" DIPILIH */}
                        {filter === 'Custom' && (
                            <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                                <input type="date" className="text-xs text-slate-600 outline-none px-2 py-1 bg-transparent" value={customDates.from} onChange={e => setCustomDates({ ...customDates, from: e.target.value })} />
                                <span className="text-slate-300 text-xs">-</span>
                                <input type="date" className="text-xs text-slate-600 outline-none px-2 py-1 bg-transparent" value={customDates.to} onChange={e => setCustomDates({ ...customDates, to: e.target.value })} />
                                <button
                                    onClick={handleCustomApply}
                                    disabled={!customDates.from || !customDates.to || isFetching}
                                    className="bg-purple-600 text-white text-xs px-4 py-1.5 rounded-full font-bold hover:bg-purple-700 disabled:opacity-50 transition-all"
                                >
                                    Apply
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ✅ UPDATE 3: TAMBAHKAN ID "report-content" DAN BACKGROUND COLOR */}
            {/* Wrapper ini yang akan "difoto" menjadi PDF, membungkus SELURUH grafik di bawahnya */}
            <div
                id="report-content"
                className={cn(
                    "transition-opacity duration-500 bg-[#fafafa] p-1 sm:p-4 rounded-3xl",
                    isFetching && "opacity-50 pointer-events-none"
                )}
            >
                <div className="space-y-6">

                    {/* KARTU STATISTIK (Gunakan `data` state, bukan `initialData` lagi) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Focus Hours</p>
                                <h3 className="text-4xl font-extrabold text-slate-900">{data.stats.totalHours} <span className="text-lg text-slate-400 font-semibold">hrs</span></h3>
                                <p className={cn("text-xs font-bold mt-2 flex items-center gap-1", data.stats.focusTrend.isPositive ? "text-emerald-500" : "text-rose-500")}>
                                    {data.stats.focusTrend.text}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><Clock className="w-6 h-6" /></div>
                        </div>

                        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Session Duration</p>
                                <h3 className="text-4xl font-extrabold text-slate-900">{data.stats.avgSession} <span className="text-lg text-slate-400 font-semibold">min</span></h3>
                                <p className={cn("text-xs font-bold mt-2", data.stats.sessionInsight.colorClass)}>
                                    {data.stats.sessionInsight.text}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><Target className="w-6 h-6" /></div>
                        </div>

                        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Focus Streak</p>
                                <h3 className="text-4xl font-extrabold text-slate-900">{data.stats.streak} <span className="text-lg text-slate-400 font-semibold">days</span></h3>
                                <p className={cn("text-xs font-bold mt-2 flex items-center gap-1", data.stats.streakInsight.colorClass)}>
                                    {data.stats.streakInsight.text}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center"><Zap className="w-6 h-6 fill-current" /></div>
                        </div>

                    </div>

                    {/* --- BANNER FOCUS GOAL --- */}
                    {(() => {
                        // Kalkulasi Progress
                        const currentHours = parseFloat(data.stats.totalHours);
                        const rawPercentage = (currentHours / goalHours) * 100;
                        const progressPercentage = Math.min(rawPercentage, 100);
                        const isAchieved = currentHours >= goalHours;

                        return (
                            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 mt-6 mb-6 relative overflow-hidden">

                                {/* Efek Latar Belakang Jika Tercapai */}
                                {isAchieved && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-transparent opacity-50 pointer-events-none" />
                                )}

                                <div className={cn(
                                    "flex-shrink-0 w-16 h-16 rounded-[1.25rem] flex items-center justify-center transition-colors",
                                    isAchieved ? "bg-emerald-100 text-emerald-600" : "bg-orange-50 text-orange-500"
                                )}>
                                    <Target className="w-8 h-8" />
                                </div>

                                <div className="flex-grow w-full z-10">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-3 gap-2 sm:gap-0">
                                        <div>
                                            <h3 className="text-base font-extrabold text-slate-900">Period Focus Goal</h3>
                                            <p className="text-xs text-slate-500 font-medium">Tetapkan dan capai target jam fokus Anda</p>
                                        </div>

                                        {/* Kontrol Target Interaktif */}
                                        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-full border border-slate-100">
                                            <button
                                                onClick={() => setGoalHours(Math.max(1, goalHours - 1))}
                                                className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-orange-500 hover:bg-orange-50 font-bold transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="text-sm font-extrabold text-slate-700 w-14 text-center">
                                                {goalHours} hrs
                                            </span>
                                            <button
                                                onClick={() => setGoalHours(goalHours + 1)}
                                                className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-orange-500 hover:bg-orange-50 font-bold transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                        {/* Teks indikator saving */}
                                        <span className="text-[10px] text-slate-400 font-medium w-16 hidden sm:block">
                                            {isSavingGoal ? 'Saving...' : 'Saved'}
                                        </span>
                                    </div>

                                    {/* Progress Bar Utama */}
                                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative">
                                        <div
                                            className={cn(
                                                "h-full transition-all duration-1000 ease-out rounded-full",
                                                isAchieved ? "bg-emerald-500" : "bg-gradient-to-r from-orange-400 to-orange-500"
                                            )}
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>

                                    {/* Teks Status di Bawah Bar */}
                                    <div className="flex justify-between mt-2">
                                        <span className="text-[11px] font-bold text-slate-400">
                                            <span className={isAchieved ? "text-emerald-600" : "text-slate-700"}>{currentHours}</span> / {goalHours} hrs terselesaikan
                                        </span>
                                        <span className={cn(
                                            "text-[11px] font-extrabold tracking-wide uppercase",
                                            isAchieved ? "text-emerald-500" : "text-orange-500"
                                        )}>
                                            {isAchieved ? '🎉 Target Achieved!' : `${Math.round(rawPercentage)}% Completed`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* MIDDLE SECTION: HEATMAP & DONUT CHART */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Productivity Heatmap */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-[1.5rem] border border-slate-100 shadow-sm overflow-x-auto">
                            <div className="flex justify-between items-end mb-6">
                                <h3 className="text-lg font-extrabold text-slate-900">Productivity Heatmap</h3>
                            </div>
                            <div className="min-w-[700px]">
                                <ActivityCalendar
                                    data={data.heatmapData}
                                    theme={{
                                        light: ['#f1f5f9', '#e9d5ff', '#d8b4fe', '#a855f7', '#7e22ce'],
                                    }}
                                    labels={{
                                        legend: { less: 'LESS', more: 'MORE' },
                                        totalCount: ' '
                                    }}
                                    showWeekdayLabels={true}
                                    renderBlock={(block, activity) =>
                                        cloneElement(block as any, {
                                            'data-tooltip-id': 'heatmap-tooltip',
                                            'data-tooltip-content': `${activity.count} sesi pada ${activity.date}`,
                                        })
                                    }
                                    blockSize={12}
                                    blockMargin={4}
                                    fontSize={12}
                                />

                                <ReactTooltip
                                    id="heatmap-tooltip"
                                    style={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}
                                />

                            </div>
                        </div>

                        {/* Project Focus */}
                        <div className="bg-white p-8 rounded-[1.5rem] border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-extrabold text-slate-900 mb-6">Project Focus</h3>
                            <div className="space-y-6">
                                {data.projectFocusData.map((item: any, index: number) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="w-10 h-10 shrink-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={[{ value: item.value }, { value: 100 - item.value }]} cx="50%" cy="50%" innerRadius={14} outerRadius={20} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                                                        <Cell fill={item.color} />
                                                        <Cell fill="#f1f5f9" />
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-bold text-slate-900">{item.name}</span>
                                                <span className="text-sm font-semibold text-slate-500">{item.value}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                <div className="h-1.5 rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM SECTION: RADAR & VELOCITY */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* WORK CHARACTER (RADAR) */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-900">Work Character</h3>
                                    <p className="text-xs text-slate-400 font-medium">Distribusi fokus berdasarkan label</p>
                                </div>

                                {(() => {
                                    const validLabels = data.labelData?.filter((l: any) => l.subject !== "No Data Yet" && l.subject !== "No Data") || [];
                                    if (validLabels.length === 0) return null;

                                    const topFocus = validLabels[0].subject;
                                    const totalMins = validLabels.reduce((acc: number, curr: any) => acc + curr.value, 0);
                                    const avgLoad = Math.round(totalMins / validLabels.length);

                                    return (
                                        <div className="flex gap-4 text-right">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Top Focus</p>
                                                <p className="text-sm font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md inline-block">
                                                    {topFocus}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Load</p>
                                                <p className="text-sm font-extrabold text-slate-700">
                                                    {avgLoad} <span className="text-[10px] text-slate-400 font-semibold">min/lbl</span>
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="h-[250px] w-full">
                                {data.labelData && data.labelData.length > 0 && !data.labelData[0].subject.includes("No Data") ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.labelData}>
                                            <PolarGrid stroke="#f1f5f9" />
                                            <PolarAngleAxis
                                                dataKey="subject"
                                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
                                            />
                                            <RechartsTooltip content={<CustomRadarTooltip />} cursor={false} />
                                            <Radar
                                                name="Minutes"
                                                dataKey="value"
                                                stroke="#6c2bd9"
                                                strokeWidth={2}
                                                fill="#6c2bd9"
                                                fillOpacity={0.2}
                                                activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-300">
                                        <Target className="w-12 h-12 mb-2 opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Belum ada label</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* VELOCITY LINE CHART */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-900">Task Completion Velocity</h3>
                                    <p className="text-sm text-slate-400 font-medium mt-1">Daily snapshot of workflow throughput</p>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#6c2bd9]"></div> Completed</div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#cbd5e1]"></div> Created</div>
                                </div>
                            </div>

                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.velocityData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} dy={10} />
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                            itemStyle={{ fontWeight: 'bold' }}
                                        />
                                        <Line type="monotone" dataKey="completed" stroke="#6c2bd9" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="created" stroke="#cbd5e1" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>

                    {/* PEAK PRODUCTIVITY TIME */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4 sm:gap-0">
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-900">Peak Productivity Time</h3>
                                <p className="text-xs text-slate-400 font-medium">Distribusi aktivitas berdasarkan jam</p>
                            </div>

                            {(() => {
                                if (!data.peakTimeData || data.peakTimeData.length === 0) return null;
                                const peakEntry = data.peakTimeData.find((d: any) => d.isPeak) || data.peakTimeData[0];
                                const maxSessions = peakEntry.sessions;
                                const peakHourStr = peakEntry.hour;

                                return (
                                    <div className="flex flex-wrap gap-4 sm:gap-6 text-left sm:text-right">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Puncak Utama</p>
                                            <p className="text-sm font-extrabold text-slate-700">{peakHourStr}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sesi Tertinggi</p>
                                            <p className="text-sm font-extrabold text-slate-700">
                                                {maxSessions} <span className="text-[10px] text-slate-400 font-semibold">sesi</span>
                                            </p>
                                        </div>
                                        <div className="sm:border-l sm:border-slate-100 sm:pl-6">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Persona</p>
                                            <p className="text-sm font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md inline-block">
                                                {data.stats.timeInsight}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.peakTimeData}>
                                    <XAxis
                                        dataKey="hour"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 'bold' }}
                                        interval={2}
                                    />
                                    <RechartsTooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl">
                                                        <p className="text-white font-bold text-xs mb-1 tracking-wider">
                                                            Jam {payload[0].payload.hour}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <div className={cn("w-2 h-2 rounded-full", payload[0].payload.isPeak ? "bg-purple-500" : "bg-slate-400")}></div>
                                                            <p className={cn("text-sm font-semibold", payload[0].payload.isPeak ? "text-purple-300" : "text-slate-300")}>
                                                                {payload[0].value} <span className="text-xs font-normal text-slate-400">sesi fokus</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="sessions" radius={[4, 4, 0, 0]}>
                                        {data.peakTimeData.map((entry: any, index: number) => (
                                            <BarCell
                                                key={`cell-${index}`}
                                                fill={entry.isPeak ? '#6c2bd9' : '#e2e8f0'}
                                                className="transition-all duration-300 hover:opacity-80"
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-[#6c2bd9]"></div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Jam Tersibuk</span>
                            </div>
                            <p className="text-[10px] text-slate-400 italic">*Data dihitung berdasarkan waktu penyelesaian sesi fokus.</p>
                        </div>
                    </div>

                </div>
            </div>
            {/* AKHIR DARI WRAPPER REPORT CONTENT */}

        </div>
    );
}