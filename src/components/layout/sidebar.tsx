'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Focus,
    CalendarDays,
    CalendarClock,
    FolderClosed,
    Tags,
    Plus,
    LogOut,
    HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/components/providers/supabase-provider';
import { SidebarQuickAdd } from './sidebar-quick-add';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Focus Mode', href: '/dashboard/focus', icon: Focus },
    { name: 'Today', href: '/dashboard/today', icon: CalendarDays },
    { name: 'Upcoming', href: '/dashboard/upcoming', icon: CalendarClock },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderClosed },
    { name: 'Labels', href: '/dashboard/labels', icon: Tags },
];

export function Sidebar() {
    const pathname = usePathname();
    const { supabase } = useSupabase();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <aside className="w-64 bg-white border-r border-purple-100 flex flex-col h-screen fixed left-0 top-0">
            {/* Logo & Brand */}
            <div className="p-6">
                <h1 className="text-2xl font-bold text-purple-700 tracking-tight">Selesai.in</h1>
                <p className="text-xs text-slate-500 mt-1">Digital Sanctuary</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${isActive
                                ? 'bg-purple-50 text-purple-700'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-purple-600'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Quick Add Button & Bottom Actions */}
            <div className="p-4 border-t border-purple-50 space-y-4">
                {/* <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Quick Add Task
                </Button> */}

                <div className="mt-auto p-4">
                    <SidebarQuickAdd />
                </div>

                <div className="space-y-1">
                    <button className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-purple-600 rounded-lg transition-colors">
                        <HelpCircle className="w-5 h-5 text-slate-400" />
                        Help
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5 text-slate-400" />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
}