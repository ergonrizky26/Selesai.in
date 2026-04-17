'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { completeTask } from '@/app/actions/task-actions';

interface Task {
    id: string;
    title: string;
}

export function PomodoroTimer({ availableTasks }: { availableTasks: Task[] }) {
    const DEFAULT_TIME = 25 * 60; // 25 Menit dalam detik
    const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
    const [isActive, setIsActive] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string>('');
    const [isCompleting, setIsCompleting] = useState(false);

    // Logika Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            // Opsional: Putar suara notifikasi di sini
            alert('Sesi fokus selesai! Waktunya istirahat 5 menit.');
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(DEFAULT_TIME);
    };

    const handleCompleteTask = async () => {
        if (!selectedTaskId) return;
        setIsCompleting(true);

        const result = await completeTask(selectedTaskId);
        if (result.success) {
            alert('Luar biasa! Tugas berhasil diselesaikan.');
            setSelectedTaskId(''); // Reset pilihan
            resetTimer(); // Reset waktu untuk tugas berikutnya
        } else {
            alert('Gagal menyelesaikan tugas.');
        }
        setIsCompleting(false);
    };

    // Format MM:SS
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');

    return (
        <div className="max-w-md mx-auto bg-white border border-purple-100 rounded-3xl shadow-sm p-8 flex flex-col items-center">
            {/* Task Selector */}
            <div className="w-full mb-8">
                <label className="block text-sm font-medium text-slate-500 mb-2 text-center">
                    Apa yang ingin Anda fokuskan?
                </label>
                <Select value={selectedTaskId} onValueChange={setSelectedTaskId} disabled={isActive}>
                    <SelectTrigger className="w-full border-purple-200 focus:ring-purple-400">
                        <SelectValue placeholder="Pilih tugas..." />
                    </SelectTrigger>
                    <SelectContent>
                        {availableTasks.length === 0 ? (
                            <SelectItem value="empty" disabled>Tidak ada tugas pending</SelectItem>
                        ) : (
                            availableTasks.map((task) => (
                                <SelectItem key={task.id} value={task.id}>
                                    {task.title}
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
            </div>

            {/* Timer Display */}
            <div className="relative flex items-center justify-center w-64 h-64 rounded-full border-8 border-purple-50 mb-8">
                <div className="absolute inset-0 rounded-full border-8 border-purple-500 border-t-transparent animate-spin-slow opacity-20" style={{ animationDuration: '10s', display: isActive ? 'block' : 'none' }}></div>
                <span className="text-6xl font-bold text-purple-900 tracking-tighter">
                    {minutes}:{seconds}
                </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 w-full">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={resetTimer}
                    className="h-14 w-14 rounded-full border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                    <RotateCcw className="w-6 h-6" />
                </Button>

                <Button
                    onClick={toggleTimer}
                    className={`flex-1 h-14 rounded-full text-lg font-semibold transition-all ${isActive
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                >
                    {isActive ? (
                        <><Pause className="w-5 h-5 mr-2" /> Pause</>
                    ) : (
                        <><Play className="w-5 h-5 mr-2 text-white fill-current" /> Start Focus</>
                    )}
                </Button>
            </div>

            {/* Complete Task Button (Muncul jika ada tugas yang dipilih) */}
            {selectedTaskId && (
                <Button
                    onClick={handleCompleteTask}
                    disabled={isCompleting}
                    variant="ghost"
                    className="mt-6 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl h-12"
                >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    {isCompleting ? 'Menyelesaikan...' : 'Tandai Tugas Selesai'}
                </Button>
            )}
        </div>
    );
}