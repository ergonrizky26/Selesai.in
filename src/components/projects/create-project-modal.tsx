'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Users, Edit3, Plus } from 'lucide-react';
import { createProject } from '@/app/actions/project-actions';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const THEME_COLORS = ['#8B5CF6', '#0D9488', '#4338CA', '#EAB308', '#F43F5E'];

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
    const [name, setName] = useState('');
    const [color, setColor] = useState(THEME_COLORS[0]);
    const [visibility, setVisibility] = useState<'private' | 'shared'>('private');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setIsSubmitting(true);

        // Note: Untuk MVP, kita simpan name & color. Logic 'shared' bisa dikembangkan nanti.
        await createProject({ name, color });

        setName('');
        setColor(THEME_COLORS[0]);
        setVisibility('private');
        setIsSubmitting(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
            <DialogContent className="sm:max-w-[600px] p-8 rounded-[2rem] border-none shadow-2xl bg-white z-[100]">

                <DialogHeader className="text-left mb-6">
                    <DialogTitle className="text-3xl font-extrabold text-slate-900">
                        Create New Project
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-sm mt-1">
                        Organize your flow with a dedicated space.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8">

                    {/* SECTION 1: PROJECT IDENTITY */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Project Identity
                        </h4>

                        <div className="relative">
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Project Name"
                                className="bg-slate-50 border-none h-14 px-5 rounded-2xl text-slate-700 font-medium placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-purple-200 text-lg"
                            />
                            <Edit3 className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                            <span className="text-sm font-semibold text-slate-600">Theme Color:</span>
                            <div className="flex items-center gap-3">
                                {THEME_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={cn(
                                            "w-8 h-8 rounded-full transition-all flex items-center justify-center",
                                            color === c ? "ring-2 ring-offset-2 ring-purple-500 scale-110" : "hover:scale-110"
                                        )}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                                <button type="button" className="w-8 h-8 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-purple-400 hover:text-purple-500 transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: VISIBILITY & ACCESS */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Visibility & Access
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Private Card */}
                            <button
                                type="button"
                                onClick={() => setVisibility('private')}
                                className={cn(
                                    "flex flex-col items-start p-5 rounded-[1.5rem] border text-left transition-all",
                                    visibility === 'private'
                                        ? "border-purple-200 bg-purple-50/50"
                                        : "border-slate-100 bg-slate-50/50 hover:bg-slate-100/50"
                                )}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Lock className={cn("w-5 h-5", visibility === 'private' ? "text-purple-600" : "text-slate-400")} />
                                    <span className={cn("font-bold", visibility === 'private' ? "text-purple-900" : "text-slate-700")}>Private</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Only you can see and manage this project.
                                </p>
                            </button>

                            {/* Shared Card */}
                            <button
                                type="button"
                                onClick={() => setVisibility('shared')}
                                className={cn(
                                    "flex flex-col items-start p-5 rounded-[1.5rem] border text-left transition-all",
                                    visibility === 'shared'
                                        ? "border-purple-200 bg-purple-50/50"
                                        : "border-slate-100 bg-slate-50/50 hover:bg-slate-100/50"
                                )}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className={cn("w-5 h-5", visibility === 'shared' ? "text-purple-600" : "text-slate-400")} />
                                    <span className={cn("font-bold", visibility === 'shared' ? "text-purple-900" : "text-slate-700")}>Shared</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Invite team members to collaborate together.
                                </p>
                            </button>
                        </div>
                    </div>

                </div>

                {/* FOOTER: Actions */}
                <div className="flex items-center justify-between mt-10 pt-6">

                    {/* Avatar Group Placeholder */}
                    <div className="flex items-center gap-4">
                        {visibility === 'shared' && (
                            <>
                                <div className="flex -space-x-2">
                                    <Avatar className="w-8 h-8 border-2 border-white"><AvatarImage src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" /></Avatar>
                                    <Avatar className="w-8 h-8 border-2 border-white"><AvatarImage src="https://api.dicebear.com/7.x/notionists/svg?seed=Aneka" /></Avatar>
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">+3</div>
                                </div>
                                <button type="button" className="text-xs font-bold text-purple-600 hover:text-purple-800">
                                    Manage<br />Access
                                </button>
                            </>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={!name.trim() || isSubmitting}
                            onClick={handleSubmit}
                            className="bg-[#6c2bd9] hover:bg-[#5b21b6] text-white rounded-2xl font-bold px-8 shadow-xl shadow-purple-200"
                        >
                            {isSubmitting ? 'INITIALIZING...' : 'INITIALIZE PROJECT'}
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}