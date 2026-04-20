'use client';

import { useEffect, useState } from 'react';

interface GreetingProps {
    user: any; // Data user dari Supabase
}

export function Greeting({ user }: GreetingProps) {
    // Set default state untuk SSR (menghindari layout shift)
    const [greeting, setGreeting] = useState('Selamat Pagi');
    const [isVisible, setIsVisible] = useState(false);
    const [firstName, setFirstName] = useState('Admin');

    useEffect(() => {
        // Ambil jam lokal dari perangkat pengguna
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 11) {
            setGreeting('Selamat Pagi');
        } else if (hour >= 11 && hour < 15) {
            setGreeting('Selamat Siang');
        } else if (hour >= 15 && hour < 18) {
            setGreeting('Selamat Sore');
        } else {
            setGreeting('Selamat Malam');
        }

        // 2. Logika Ekstraksi Nama Depan
        if (user) {
            const fullName = user?.user_metadata?.full_name || "";
            const email = user?.email || "";

            let nameToDisplay = "Admin";

            if (fullName.trim()) {
                // Ambil kata pertama dari nama lengkap
                nameToDisplay = fullName.split(' ')[0];
            } else if (email) {
                // Fallback ke bagian depan email jika nama kosong
                nameToDisplay = email.split('@')[0];
            }

            // Pastikan huruf pertama kapital (Budi, bukan budi)
            const capitalizedName = nameToDisplay.charAt(0).toUpperCase() + nameToDisplay.slice(1);
            setFirstName(capitalizedName);
        }

        // Tampilkan teks setelah deteksi selesai untuk transisi yang mulus
        setIsVisible(true);
    }, []);

    return (
        <span
            className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            {greeting}, {firstName}!
        </span>
    );
}