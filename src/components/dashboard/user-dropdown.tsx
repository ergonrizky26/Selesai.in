'use client';

import { useState } from 'react';
import { LogOut, Settings, User, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOutUser } from '@/app/actions/auth-actions';
import { AccountSettingsModal } from '@/components/settings/account-settings-modal'; // <-- IMPORT MODAL

interface UserDropdownProps {
    user: {
        email?: string;
        user_metadata?: {
            full_name?: string;
            avatar_url?: string;
        };
    } | null;
}

export function UserDropdown({ user }: UserDropdownProps) {
    // STATE UNTUK MODAL SETTINGS
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pengguna';
    const initials = fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-slate-100">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarImage src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}&backgroundColor=8b5cf6`} alt={fullName} />
                            <AvatarFallback className="bg-[#6c2bd9] text-white font-bold text-xs">{initials}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-72 rounded-[1.5rem] p-2 shadow-xl border-slate-100" align="end">
                    <DropdownMenuLabel className="font-normal p-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 border border-slate-100 shadow-sm">
                                <AvatarImage src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}&backgroundColor=8b5cf6`} alt={fullName} />
                                <AvatarFallback className="bg-[#6c2bd9] text-white font-bold">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col space-y-0.5">
                                <p className="text-sm font-bold text-slate-900 leading-none">{fullName}</p>
                                <p className="text-[11px] font-medium text-slate-500 leading-none mt-1">
                                    Premium Sanctuary Member
                                </p>
                            </div>
                        </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator className="bg-slate-50 mb-2" />

                    <DropdownMenuGroup className="space-y-1">
                        <DropdownMenuItem className="h-12 px-4 rounded-xl cursor-pointer hover:bg-slate-50 text-slate-600 font-medium transition-colors">
                            <User className="mr-3 h-4 w-4" />
                            <span>Profile Details</span>
                        </DropdownMenuItem>

                        {/* PERBAIKAN: Trigger Modal Settings */}
                        <DropdownMenuItem
                            onClick={() => setIsSettingsOpen(true)}
                            className="h-12 px-4 rounded-xl cursor-pointer bg-purple-50 text-purple-700 font-bold transition-colors focus:bg-purple-100 focus:text-purple-800"
                        >
                            <Settings className="mr-3 h-4 w-4" />
                            <span>Account Settings</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem className="h-12 px-4 rounded-xl cursor-pointer hover:bg-slate-50 text-slate-600 font-medium transition-colors">
                            <Award className="mr-3 h-4 w-4" />
                            <span>Subscription Plan</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator className="bg-slate-50 my-2" />

                    <DropdownMenuItem
                        className="h-12 px-4 rounded-xl cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 font-bold transition-colors"
                        onClick={() => signOutUser()}
                    >
                        <LogOut className="mr-3 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* RENDER MODAL DI LUAR DROPDOWN MENU */}
            <AccountSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                user={user}
            />
        </>
    );
}