'use client';

import { useProgress } from '@react-three/drei';

export function LoadingScreen() {
    const { progress, active } = useProgress();

    if (!active && progress === 100) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-500">
            <h1 className="text-4xl font-bold text-amber-500 tracking-widest mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
                VIMANA
            </h1>
            <div className="w-64 h-1 bg-gray-900 rounded-full overflow-hidden">
                <div
                    className="h-full bg-cyan-500 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="mt-2 text-cyan-500/60 font-mono text-xs">
                INITIALIZING SYSTEMS... {Math.round(progress)}%
            </p>
        </div>
    );
}
