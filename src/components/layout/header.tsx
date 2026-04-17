import { Search, Bell, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function Header() {
    return (
        <header className="h-16 border-b border-purple-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
            {/* Global Search */}
            <div className="w-96 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                    type="text"
                    placeholder="Search your sanctuary..."
                    className="pl-10 bg-slate-50 border-transparent focus-visible:ring-purple-200 focus-visible:bg-white"
                />
            </div>

            {/* Utilities & Profile */}
            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full border border-white"></span>
                </button>
                <button className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-purple-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                    {/* Fallback avatar */}
                    <span className="text-xs font-bold text-purple-700">ME</span>
                </div>
            </div>
        </header>
    );
}