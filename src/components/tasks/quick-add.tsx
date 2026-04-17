'use client';

import { useState } from 'react';
import { Plus, Calendar as CalendarIcon, Flag, MessageSquare, FolderKanban, ChevronDown, Tag as TagIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { quickAddTask } from '@/app/actions/task-actions';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface QuickAddProps {
    projects?: { id: string; name: string; color: string | null }[];
    availableLabels?: { id: string; name: string; color: string | null }[];
}

export function QuickAdd({ projects = [], availableLabels = [] }: QuickAddProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState<Date | undefined>();
    const [priority, setPriority] = useState('p4');
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

    const toggleLabel = (name: string) => {
        setSelectedLabels(prev =>
            prev.includes(name) ? prev.filter(l => l !== name) : [...prev, name]
        );
    };

    const handleSubmit = async () => {
        if (!title.trim()) return;
        setIsSubmitting(true);

        // PERBAIKAN: Ubah date menjadi ISO String agar aman menyeberang ke Server Action
        const res = await quickAddTask(title, {
            description,
            dueDateStr: date ? date.toISOString() : undefined, // <--- Perubahan di sini
            priority,
            projectId: selectedProjectId || undefined,
            labels: selectedLabels
        });

        if (res.success) {
            resetForm();
        }
        setIsSubmitting(false);
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDate(undefined);
        setPriority('p4');
        setSelectedProjectId('');
        setSelectedLabels([]);
        setIsExpanded(false);
    };

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="w-full flex items-center gap-3 px-4 py-4 text-slate-400 hover:text-purple-600 bg-white border border-slate-100 rounded-2xl transition-all group hover:border-purple-200 hover:shadow-sm"
            >
                <Plus className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-sm">Tambah tugas baru ke "Inbox"...</span>
            </button>
        );
    }

    return (
        <div className="bg-white border-2 border-purple-100 rounded-[2rem] p-6 shadow-xl shadow-purple-100/40 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-3">
                <Input
                    autoFocus
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                    placeholder="Apa yang ingin Anda selesaikan?"
                    className="border-none shadow-none text-xl font-bold focus-visible:ring-0 p-0 h-auto placeholder:text-slate-200"
                />
                <div className="flex items-start gap-2 text-slate-400">
                    <MessageSquare className="w-4 h-4 mt-1 opacity-40" />
                    <Textarea
                        value={description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                        placeholder="Tambahkan deskripsi detail di sini..."
                        className="border-none shadow-none focus-visible:ring-0 p-0 min-h-[80px] resize-none text-sm placeholder:text-slate-300"
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-5 border-t border-slate-50">
                <div className="flex flex-wrap items-center gap-2">
                    {/* Date Picker */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className={cn("h-9 rounded-xl border-slate-100 text-xs gap-2 px-3", date && "text-purple-600 border-purple-200 bg-purple-50")}>
                                <CalendarIcon className="w-4 h-4" />
                                {date ? format(date, 'd MMM yyyy', { locale: id }) : 'Set Tanggal'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-none" align="start">
                            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                        </PopoverContent>
                    </Popover>

                    {/* Priority Picker */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className={cn("h-9 rounded-xl border-slate-100 text-xs gap-2 px-3", priority !== 'p4' && "bg-slate-50")}>
                                <Flag className={cn("w-4 h-4", {
                                    'text-red-500 fill-red-500': priority === 'p1',
                                    'text-orange-500 fill-orange-500': priority === 'p2',
                                    'text-blue-500 fill-blue-500': priority === 'p3',
                                    'text-slate-400': priority === 'p4',
                                })} />
                                {priority.toUpperCase()}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40 p-2 rounded-2xl shadow-2xl border-none" align="start">
                            {['p1', 'p2', 'p3', 'p4'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPriority(p)}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-purple-50 rounded-xl transition-colors flex items-center gap-3 font-medium text-slate-600"
                                >
                                    <Flag className={cn("w-4 h-4", p === 'p1' ? 'text-red-500 fill-red-500' : p === 'p2' ? 'text-orange-500 fill-orange-500' : p === 'p3' ? 'text-blue-500 fill-blue-500' : 'text-slate-300')} />
                                    Priority {p.slice(1)}
                                </button>
                            ))}
                        </PopoverContent>
                    </Popover>

                    {/* Project Selector (BARU) */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className={cn("h-9 rounded-xl border-slate-100 text-xs gap-2 px-3", selectedProjectId && "text-purple-600 border-purple-200 bg-purple-50")}>
                                <FolderKanban className="w-4 h-4" />
                                {selectedProjectId ? projects.find(p => p.id === selectedProjectId)?.name : 'Pilih Proyek'}
                                <ChevronDown className="w-3 h-3 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2 rounded-2xl shadow-2xl border-none" align="start">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Pindahkan ke:</div>
                            <button
                                onClick={() => setSelectedProjectId('')}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-purple-50 rounded-xl transition-colors flex items-center gap-3 font-medium text-slate-600"
                            >
                                <div className="w-2 h-2 rounded-full bg-slate-300" /> Inbox (Default)
                            </button>
                            {projects.map((project) => (
                                <button
                                    key={project.id}
                                    onClick={() => setSelectedProjectId(project.id)}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-purple-50 rounded-xl transition-colors flex items-center gap-3 font-medium text-slate-600"
                                >
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: project.color || '#8B5CF6' }}
                                    />
                                    {project.name}
                                </button>
                            ))}
                        </PopoverContent>
                    </Popover>

                    {/* Label Selector */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className={cn("h-9 rounded-xl border-slate-100 text-xs gap-2 px-3", selectedLabels.length > 0 && "text-blue-600 border-blue-200 bg-blue-50")}>
                                <TagIcon className="w-4 h-4" />
                                {selectedLabels.length > 0 ? `${selectedLabels.length} Label` : 'Label'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2 rounded-2xl shadow-2xl border-none" align="start">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Pilih Label:</div>
                            <div className="max-h-48 overflow-y-auto space-y-1">
                                {availableLabels.map((label) => (
                                    <button
                                        key={label.id}
                                        onClick={() => toggleLabel(label.name)}
                                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between font-medium text-slate-600"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: label.color || '#8B5CF6' }} />
                                            {label.name}
                                        </div>
                                        {selectedLabels.includes(label.name) && <Check className="w-3 h-3 text-blue-600" />}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    <Button variant="ghost" onClick={resetForm} className="rounded-xl font-bold text-slate-400 hover:text-slate-600">
                        Batal
                    </Button>
                    <Button
                        disabled={!title.trim() || isSubmitting}
                        onClick={handleSubmit}
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold px-8 h-11 shadow-lg shadow-purple-200 transition-all active:scale-95"
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Tambah Tugas'}
                    </Button>
                </div>
            </div>
        </div>
    );
}