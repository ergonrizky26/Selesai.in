'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Droplets, Coffee, Wind, Target, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { completeTask } from '@/app/actions/task-actions';
import { saveFocusSession } from '@/app/actions/focus-actions'; // IMPORT ACTION BARU
import { useRouter } from 'next/navigation'; // UNTUK REFRESH DATA

const AMBIENT_SOUNDS = [
    { id: 'rain', name: 'Rain', icon: Droplets, url: 'https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3' },
    { id: 'cafe', name: 'Cafe', icon: Coffee, url: 'https://assets.mixkit.co/active_storage/sfx/114/114-preview.mp3' },
    { id: 'noise', name: 'White Noise', icon: Wind, url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
];

const FOCUS_TIME = 25 * 60; // 25 Menit dalam detik

export function FocusDashboard({ initialTasks }: { initialTasks: any[] }) {
    const router = useRouter();

    // --- TIMER STATE ---
    const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
    const [isActive, setIsActive] = useState(false);

    // State baru untuk melacak apakah notifikasi/penyimpanan sedang diproses
    const [isSaving, setIsSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState("Ready to focus.");

    // --- TASK STATE ---
    const [queue, setQueue] = useState(initialTasks);
    const activeTask = queue.length > 0 ? queue[0] : null;
    const upcomingTasks = queue.slice(1, 3);

    // --- AUDIO STATE ---
    const [activeAudio, setActiveAudio] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // LOGIKA TIMER
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        } else if (isActive && timeLeft === 0) {
            // TIMER SELESAI SECARA NATURAL (MENCAPAI 0)
            setIsActive(false);
            handleSessionComplete(25); // Simpan sesi penuh 25 menit
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => { setIsActive(false); setTimeLeft(FOCUS_TIME); };

    // FUNGSI UNTUK MENYIMPAN SESI KE DATABASE
    const handleSessionComplete = async (durationMinutes: number) => {
        if (durationMinutes <= 0) return; // Abaikan jika belum fokus sama sekali

        setIsSaving(true);
        setToastMessage(`Saving ${durationMinutes} min session...`);

        // Mainkan suara sukses singkat (opsional)
        const successSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
        successSound.volume = 0.4;
        successSound.play().catch(e => console.log('Audio blocked', e));

        // Panggil Server Action
        const res = await saveFocusSession(
            durationMinutes,
            activeTask?.id,
            activeTask?.projectId
        );

        if (res?.success) {
            setToastMessage(`Great job! ${durationMinutes} minutes recorded.`);
            resetTimer(); // Kembalikan timer ke 25:00
            router.refresh(); // Refresh halaman agar data terbaru terambil
        } else {
            setToastMessage("Gagal menyimpan sesi.");
        }

        setIsSaving(false);

        // Sembunyikan toast setelah 4 detik
        setTimeout(() => setToastMessage("Ready to focus."), 4000);
    };

    // LOGIKA TUGAS SELESAI ("MARK AS DONE")
    const handleCompleteTask = async (taskId: string) => {
        setIsSaving(true);

        // 1. Hitung berapa menit user sudah fokus (pembulatan ke bawah)
        const secondsFocused = FOCUS_TIME - timeLeft;
        const minutesFocused = Math.floor(secondsFocused / 60);

        // 2. Jika user sudah fokus minimal 1 menit, simpan sesinya
        if (minutesFocused >= 1) {
            await saveFocusSession(minutesFocused, activeTask?.id, activeTask?.projectId);
        }

        // 3. Selesaikan tugasnya
        await completeTask(taskId);

        // 4. Update UI & reset timer untuk tugas berikutnya
        setQueue(prev => prev.filter(t => t.id !== taskId));
        resetTimer();
        setIsSaving(false);

        setToastMessage(`Task done! ${minutesFocused > 0 ? `${minutesFocused} min recorded.` : ''}`);
        setTimeout(() => setToastMessage("Ready to focus."), 4000);
    };

    // LOGIKA AUDIO AMBIENT
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        if (activeAudio) {
            const sound = AMBIENT_SOUNDS.find(s => s.id === activeAudio);
            if (sound) {
                audioRef.current = new Audio(sound.url);
                audioRef.current.loop = true;
                audioRef.current.volume = 0.5;
                audioRef.current.play().catch(e => console.log('Audio autoplay blocked', e));
            }
        }
        return () => { if (audioRef.current) audioRef.current.pause(); };
    }, [activeAudio]);

    const toggleAudio = (id: string) => setActiveAudio(prev => prev === id ? null : id);

    // FORMAT TIMER & LINGKARAN (SVG)
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const radius = 140;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (timeLeft / FOCUS_TIME) * circumference;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto h-[80vh]">

            {/* KIRI: AREA TIMER UTAMA */}
            <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-10 flex flex-col items-center justify-center relative shadow-sm border border-slate-100/50">

                {/* Lingkaran Timer SVG */}
                <div className="relative w-80 h-80 flex items-center justify-center">
                    <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 320 320">
                        {/* Background Track */}
                        <circle cx="160" cy="160" r={radius} className="stroke-slate-100" strokeWidth="12" fill="none" />
                        {/* Progress Circle */}
                        <circle
                            cx="160" cy="160" r={radius}
                            className="stroke-[#6c2bd9] transition-all duration-1000 ease-linear"
                            strokeWidth="12" fill="none" strokeLinecap="round"
                            style={{ strokeDasharray: circumference, strokeDashoffset: strokeDashoffset }}
                        />
                    </svg>

                    <div className="text-center z-10 flex flex-col items-center">
                        <h1 className="text-7xl font-extrabold text-slate-900 tracking-tighter tabular-nums mb-2">
                            {formatTime(timeLeft)}
                        </h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">
                            {isActive ? 'Focusing' : 'Paused'}
                        </p>
                    </div>
                </div>

                {/* Kontrol Timer */}
                <div className="flex items-center gap-6 mt-16">
                    <button onClick={resetTimer} disabled={isSaving} className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50">
                        <RotateCcw className="w-6 h-6" />
                    </button>

                    <Button
                        onClick={toggleTimer}
                        disabled={isSaving}
                        className={cn(
                            "rounded-full font-bold h-16 px-12 shadow-2xl transition-all text-lg",
                            isActive ? "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20" : "bg-[#6c2bd9] hover:bg-[#5b21b6] text-white shadow-purple-600/30",
                            isSaving && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isActive ? 'Pause Session' : 'Start Session'}
                    </Button>

                    {/* Tombol Stop & Save Manual */}
                    <button
                        onClick={() => handleSessionComplete(Math.floor((FOCUS_TIME - timeLeft) / 60))}
                        disabled={isSaving || timeLeft === FOCUS_TIME}
                        title="End & Save Session"
                        className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Pause className="w-6 h-6" />
                    </button>
                </div>

                {/* Toast Notifikasi (Dinamis) */}
                <div className="absolute bottom-10 bg-white border border-slate-100 shadow-sm px-6 py-3 rounded-full flex items-center gap-3">
                    <CheckCircle2 className={cn("w-5 h-5", toastMessage.includes("Ready") ? "text-slate-300" : "text-emerald-400")} />
                    <span className="text-sm font-medium text-slate-600">
                        {toastMessage}
                    </span>
                </div>
            </div>

            {/* KANAN: SIDEBAR KONTEKS (TUGAS & AUDIO) */}
            <div className="lg:col-span-5 flex flex-col gap-8 h-full overflow-y-auto pr-2 pb-10">

                {/* 1. FOCUSING ON CARD */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Focusing On</h4>
                    {activeTask ? (
                        <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-purple-100/50 border-l-4 border-[#6c2bd9] relative overflow-hidden group">
                            <div className="absolute top-6 right-6 text-purple-200 group-hover:text-purple-400 transition-colors">
                                <Target className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 pr-8 leading-tight">{activeTask.title}</h3>
                            <p className="text-sm text-slate-500 mb-6 line-clamp-3">{activeTask.description || 'Tidak ada detail spesifik untuk tugas ini.'}</p>

                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-3 py-1.5 rounded-full uppercase tracking-wider">{activeTask.priority || 'P4'}</span>
                                {activeTask.labels?.map((l: string) => (
                                    <span key={l} className="text-[10px] font-bold bg-slate-50 text-slate-500 px-3 py-1.5 rounded-full uppercase tracking-wider">{l}</span>
                                ))}
                            </div>

                            <Button
                                onClick={() => handleCompleteTask(activeTask.id)}
                                disabled={isSaving}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 font-bold shadow-lg shadow-slate-900/20 disabled:opacity-70"
                            >
                                {isSaving ? 'Saving...' : 'Mark as Done'}
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2rem] p-8 border-2 border-dashed border-slate-100 text-center text-slate-400">Tidak ada tugas dalam antrean.</div>
                    )}
                </div>

                {/* 2. UP NEXT IN QUEUE */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Up Next in Queue</h4>
                        <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2.5 py-1 rounded-md">{upcomingTasks.length} Tasks</span>
                    </div>
                    <div className="space-y-3">
                        {upcomingTasks.map((task: any) => (
                            <div key={task.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-slate-300" />
                                <span className="text-sm font-semibold text-slate-600 truncate">{task.title}</span>
                            </div>
                        ))}
                        {upcomingTasks.length === 0 && <p className="text-xs text-slate-400 pl-2">Antrean kosong.</p>}
                    </div>
                </div>

                {/* 3. AMBIENT SANCTUARY */}
                <div className="space-y-4 mt-auto">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Ambient Sanctuary</h4>
                    <div className="grid grid-cols-3 gap-3">
                        {AMBIENT_SOUNDS.map((sound) => {
                            const Icon = sound.icon;
                            const isActiveSound = activeAudio === sound.id;
                            return (
                                <button
                                    key={sound.id}
                                    onClick={() => toggleAudio(sound.id)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-4 rounded-2xl gap-3 transition-all",
                                        isActiveSound
                                            ? "bg-[#6c2bd9] text-white shadow-xl shadow-purple-600/30 scale-105"
                                            : "bg-white text-slate-400 hover:bg-slate-50 hover:text-purple-600 border border-slate-100"
                                    )}
                                >
                                    <Icon className={cn("w-6 h-6", isActiveSound && "animate-pulse")} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{sound.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}