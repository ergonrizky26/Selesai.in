'use client';

import { useState } from 'react';
import { useSupabase } from '@/components/providers/supabase-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function LoginForm() {
    const { supabase } = useSupabase();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        });

        if (error) {
            alert(error.message);
        } else {
            alert('Cek email Anda untuk link login!');
        }
        setLoading(false);
    };

    return (
        <Card className="w-full max-w-md border-purple-100 shadow-xl shadow-purple-100/50">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center text-purple-900">Selesai.in</CardTitle>
                <CardDescription className="text-center">
                    Masuk ke Digital Sanctuary Anda
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-purple-700">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            className="border-purple-200 focus-visible:ring-purple-400"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-all"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Mengirim..." : "Masuk dengan Magic Link"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}