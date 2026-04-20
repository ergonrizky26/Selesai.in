import { QuickAdd } from '@/components/tasks/quick-add';
import { TaskList } from '@/components/tasks/task-list';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { AnalyticsCircle } from '@/components/dashboard/analytics-circle';
import { getUserStats } from '@/app/actions/stats-actions';
import { ProjectList } from '@/components/dashboard/project-list';
import { getTodayTasks } from '@/app/actions/task-actions';
import { getActiveProjects } from '@/app/actions/project-actions';
import { getUserLabels } from '@/app/actions/label-actions';
import { Greeting } from '@/components/dashboard/greeting';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';



export default async function DashboardPage() {
    const [stats, todayTasks, activeProjects, userLabels] = await Promise.all([
        getUserStats(),
        getTodayTasks(),
        getActiveProjects(), // Ambil daftar project
        getUserLabels() // Ambil data label
    ]);

    // 2. TAMBAHKAN BLOK KODE INISIALISASI SUPABASE INI DI DALAM FUNGSI
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll() }, setAll() { } } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Kolom Kiri & Tengah (Main Content) */}
            <div className="lg:col-span-2 space-y-8 pb-12">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight"><Greeting user={user} /></h2>
                    <p className="text-slate-500">Your digital sanctuary is ready. You have {stats.totalToday - stats.completedToday} tasks remaining today.</p>
                </div>

                {/* Gamification Cards */}
                <StatsCards streak={stats.currentStreak} progress={stats.progress} />

                <section className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Smart Quick Add</h3>
                    <QuickAdd projects={activeProjects}
                        availableLabels={userLabels} //Kirim data label ke QuickAdd 
                    />
                </section>

                <section className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Priority Tasks</h3>
                    <TaskList tasks={todayTasks} allLabels={userLabels} allProjects={activeProjects} emptyMessage="Semua tugas prioritas hari ini sudah selesai!" />
                </section>
            </div>

            {/* Kolom Kanan (Analytics & Projects) */}
            <div className="space-y-8">
                <AnalyticsCircle progress={stats.progress} />
                <ProjectList projects={activeProjects} />

                {/* Placeholder untuk Project List (Langkah Selanjutnya) */}
                <div className="bg-purple-600 p-8 rounded-[2rem] text-white shadow-lg shadow-purple-200">
                    <h3 className="text-xl font-bold mb-2">Upgrade to Pro</h3>
                    <p className="text-purple-100 text-sm mb-6">Unlock infinite sanctuary spaces and collaborative focus modes.</p>
                    <button className="w-full py-3 bg-white text-purple-600 rounded-xl font-bold text-sm hover:bg-purple-50 transition-colors">
                        GO PREMIUM
                    </button>
                </div>
            </div>
        </div>
    );
}