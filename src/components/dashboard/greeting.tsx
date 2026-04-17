'use client';

import { useEffect, useState } from 'react';

export function Greeting() {
    // Set default state untuk SSR (menghindari layout shift)
    const [greeting, setGreeting] = useState('Selamat Pagi');
    const [isVisible, setIsVisible] = useState(false);

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

        // Tampilkan teks setelah deteksi selesai untuk transisi yang mulus
        setIsVisible(true);
    }, []);

    return (
        <span
            className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            {greeting}.
        </span>
    );
}