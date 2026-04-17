import { getFocusTasks } from '@/app/actions/focus-actions';
import { FocusDashboard } from '@/components/focus/focus-dashboard';

export default async function FocusPage() {
    // Ambil antrean tugas khusus dari server
    const tasks = await getFocusTasks();

    return (
        <div className="max-w-[1400px] mx-auto pb-12">
            {/* Header Halaman (Opsional, agar mirip desain) */}
            <div className="mb-8 hidden lg:block">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Focus Mode.</h2>
                <p className="text-slate-500">Masuk ke dalam kondisi kerja mendalam (deep work).</p>
            </div>

            {/* Render Mesin Dashboard Focus */}
            <FocusDashboard initialTasks={tasks} />
        </div>
    );
}


// import { getIncompleteTasks } from '@/app/actions/task-actions';
// import { PomodoroTimer } from '@/components/focus/pomodoro-timer';

// export const metadata = {
//     title: 'Focus Mode | Selesai.in',
// };

// export default async function FocusPage() {
//     // Ambil data tugas di sisi server
//     const tasks = await getIncompleteTasks();

//     return (
//         <div className="max-w-4xl mx-auto space-y-8 pb-12 h-full flex flex-col justify-center">
//             <div className="text-center space-y-2 mb-8">
//                 <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Deep Work.</h2>
//                 <p className="text-slate-500">Hilangkan distraksi. Pilih satu tugas dan selesaikan.</p>
//             </div>

//             <PomodoroTimer availableTasks={tasks} />
//         </div>
//     );
// }