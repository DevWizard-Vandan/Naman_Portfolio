'use client';

import dynamic from 'next/dynamic';
import { Overlay } from '@/components/ui/Overlay';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

// Dynamic import for R3F components (avoid SSR issues)
const Experience = dynamic(
    () => import('@/components/canvas/Experience').then((mod) => mod.Experience),
    { ssr: false }
);

export default function Home() {
    return (
        <main className="h-screen w-screen relative overflow-hidden">
            <LoadingScreen />
            {/* 3D Canvas */}
            <Experience />

            {/* Mandala HUD Overlay */}
            <Overlay />

            {/* Title overlay */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center pointer-events-none z-20">
                <h1
                    className="text-2xl tracking-[0.4em] uppercase"
                    style={{
                        fontFamily: 'Cinzel, serif',
                        color: '#ffd700',
                        textShadow: '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.2)'
                    }}
                >
                    Vimana
                </h1>
                <p
                    className="text-[10px] tracking-[0.5em] mt-2 uppercase"
                    style={{
                        fontFamily: 'Cinzel, serif',
                        color: 'rgba(79, 158, 255, 0.6)'
                    }}
                >
                    Naman Sharma • Full-Stack Systems
                </p>
            </div>
        </main>
    );
}
