'use client';

import { useFlightStore } from '@/store/store';
import { useEffect, useState } from 'react';

// SVG Mandala crosshair component
function MandalaCrosshair({ isBoostActive }: { isBoostActive: boolean }) {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <svg
                viewBox="0 0 100 100"
                className={`w-20 h-20 transition-all duration-200 ${isBoostActive ? 'w-28 h-28' : ''
                    }`}
                style={{
                    animation: `spin ${isBoostActive ? '2s' : '8s'} linear infinite`,
                    filter: isBoostActive
                        ? 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.8))'
                        : 'drop-shadow(0 0 6px rgba(79, 158, 255, 0.5))'
                }}
            >
                {/* Outer ring */}
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={isBoostActive ? '#ffd700' : '#4f9eff'}
                    strokeWidth="1"
                    opacity="0.6"
                />

                {/* Inner ring */}
                <circle
                    cx="50"
                    cy="50"
                    r="30"
                    fill="none"
                    stroke={isBoostActive ? '#ffd700' : '#00ffff'}
                    strokeWidth="0.5"
                    opacity="0.4"
                />

                {/* Mandala petals - 8 pointed */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                    <g key={angle} transform={`rotate(${angle} 50 50)`}>
                        <path
                            d="M 50 10 Q 55 25 50 35 Q 45 25 50 10"
                            fill="none"
                            stroke={isBoostActive ? '#ffd700' : '#4f9eff'}
                            strokeWidth="1"
                            opacity="0.8"
                        />
                    </g>
                ))}

                {/* Inner diamond pattern */}
                {[0, 90, 180, 270].map((angle) => (
                    <g key={`d-${angle}`} transform={`rotate(${angle} 50 50)`}>
                        <path
                            d="M 50 20 L 55 30 L 50 40 L 45 30 Z"
                            fill="none"
                            stroke={isBoostActive ? '#00ffff' : '#4f9eff'}
                            strokeWidth="0.8"
                            opacity="0.6"
                        />
                    </g>
                ))}

                {/* Center dot */}
                <circle
                    cx="50"
                    cy="50"
                    r="2"
                    fill={isBoostActive ? '#ffd700' : '#00ffff'}
                    opacity="0.8"
                />
            </svg>
        </div>
    );
}

export function Overlay() {
    const { altitude, speed, isBoostActive, isGameStarted, startGame } = useFlightStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isGameStarted && (e.code === 'Enter' || e.code === 'KeyE')) {
                startGame();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isGameStarted, startGame]);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-10">
            {/* INTRO SCREEN */}
            <div
                className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${isGameStarted ? 'opacity-0 pointer-events-none' : 'opacity-100'
                    }`}
                style={{ background: 'rgba(0,0,0,0.4)' }}
            >
                <h1 className="text-6xl text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500 font-bold tracking-widest uppercase mb-4"
                    style={{ fontFamily: 'Cinzel, serif', textShadow: '0 0 30px rgba(255, 180, 0, 0.5)' }}>
                    Vimana
                </h1>
                <p className="text-cyan-400/80 tracking-[0.5em] text-sm mb-12 uppercase">
                    Journey into the Unknown
                </p>
                <div className="animate-pulse border border-cyan-500/30 px-6 py-3 rounded-full bg-black/40 backdrop-blur-md">
                    <span className="text-cyan-400 font-mono tracking-wider text-sm">
                        PRESS <span className="text-yellow-400 font-bold mx-1">E</span> OR <span className="text-yellow-400 font-bold mx-1">ENTER</span> TO START
                    </span>
                </div>
            </div>

            {/* GAME HUD (Hidden during Intro) */}
            <div className={`transition-opacity duration-1000 ${isGameStarted ? 'opacity-100' : 'opacity-0'}`}>

                {/* Top-left: Flight telemetry panel */}
                <div
                    className="absolute top-6 left-6 p-5 rounded-xl min-w-[220px]"
                    style={{
                        background: 'rgba(5, 5, 15, 0.6)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(79, 158, 255, 0.3)',
                        boxShadow: '0 0 30px rgba(79, 158, 255, 0.1), inset 0 0 30px rgba(79, 158, 255, 0.03)'
                    }}
                >
                    <div
                        className="text-[10px] tracking-[0.3em] mb-4 uppercase"
                        style={{
                            color: 'rgba(79, 158, 255, 0.6)',
                            fontFamily: 'Cinzel, serif'
                        }}
                    >
                        Flight Systems
                    </div>

                    <div className="space-y-4">
                        {/* Altitude */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span
                                    className="text-xs tracking-widest"
                                    style={{
                                        color: 'rgba(0, 255, 255, 0.7)',
                                        fontFamily: 'Cinzel, serif'
                                    }}
                                >
                                    ALTITUDE
                                </span>
                                <span
                                    className="text-lg font-bold"
                                    style={{
                                        color: '#4f9eff',
                                        textShadow: '0 0 15px rgba(79, 158, 255, 0.8)'
                                    }}
                                >
                                    {altitude.toFixed(1)}
                                    <span className="text-xs ml-1 opacity-60">m</span>
                                </span>
                            </div>
                            <div
                                className="h-1 rounded-full overflow-hidden"
                                style={{ background: 'rgba(79, 158, 255, 0.15)' }}
                            >
                                <div
                                    className="h-full rounded-full transition-all duration-150"
                                    style={{
                                        width: `${Math.min(100, altitude * 2)}%`,
                                        background: 'linear-gradient(90deg, #4f9eff, #00ffff)'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Velocity */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span
                                    className="text-xs tracking-widest"
                                    style={{
                                        color: 'rgba(0, 255, 255, 0.7)',
                                        fontFamily: 'Cinzel, serif'
                                    }}
                                >
                                    VELOCITY
                                </span>
                                <span
                                    className={`text-lg font-bold transition-colors duration-200`}
                                    style={{
                                        color: isBoostActive ? '#ffd700' : '#4f9eff',
                                        textShadow: `0 0 15px ${isBoostActive ? 'rgba(255, 215, 0, 0.8)' : 'rgba(79, 158, 255, 0.8)'}`
                                    }}
                                >
                                    {speed.toFixed(1)}
                                    <span className="text-xs ml-1 opacity-60">m/s</span>
                                </span>
                            </div>
                            <div
                                className="h-1 rounded-full overflow-hidden"
                                style={{ background: 'rgba(255, 215, 0, 0.1)' }}
                            >
                                <div
                                    className="h-full rounded-full transition-all duration-150"
                                    style={{
                                        width: `${Math.min(100, speed * 3)}%`,
                                        background: isBoostActive
                                            ? 'linear-gradient(90deg, #ffd700, #ff8c00)'
                                            : 'linear-gradient(90deg, #4f9eff, #00ffff)'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top-right: System status */}
                <div
                    className="absolute top-6 right-6 px-5 py-3 rounded-xl"
                    style={{
                        background: 'rgba(5, 5, 15, 0.6)',
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${isBoostActive ? 'rgba(255, 215, 0, 0.4)' : 'rgba(0, 255, 200, 0.3)'}`,
                        boxShadow: isBoostActive
                            ? '0 0 20px rgba(255, 215, 0, 0.2)'
                            : '0 0 20px rgba(0, 255, 200, 0.1)'
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-2.5 h-2.5 rounded-full ${isBoostActive ? 'animate-pulse' : ''}`}
                            style={{
                                background: isBoostActive ? '#ffd700' : '#00ff88',
                                boxShadow: `0 0 10px ${isBoostActive ? '#ffd700' : '#00ff88'}`
                            }}
                        />
                        <span
                            className="text-sm uppercase tracking-wider"
                            style={{
                                color: isBoostActive ? '#ffd700' : '#00ff88',
                                fontFamily: 'Cinzel, serif',
                                textShadow: `0 0 8px ${isBoostActive ? 'rgba(255, 215, 0, 0.5)' : 'rgba(0, 255, 136, 0.5)'}`
                            }}
                        >
                            {isBoostActive ? 'ASCENDING' : 'SYSTEMS ONLINE'}
                        </span>
                    </div>
                </div>

                {/* Bottom: Controls hint */}
                <div
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full"
                    style={{
                        background: 'rgba(5, 5, 15, 0.5)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(79, 158, 255, 0.2)',
                    }}
                >
                    <div
                        className="flex gap-8 text-xs uppercase tracking-wider"
                        style={{ color: 'rgba(79, 158, 255, 0.6)' }}
                    >
                        <span><kbd className="text-cyan-400 font-bold">W/S</kbd> Thrust</span>
                        <span><kbd className="text-cyan-400 font-bold">A/D</kbd> Turn</span>
                        <span><kbd className="text-cyan-400 font-bold">Q/E</kbd> Strafe</span>
                        <span><kbd className="text-yellow-400 font-bold">Space</kbd> Lift</span>
                        <span><kbd className="text-cyan-400 font-bold">Shift</kbd> Descend</span>
                        <span><kbd className="text-green-400 font-bold">G</kbd> Gear</span>
                    </div>
                </div>
            </div>

            {/* Vignette overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(3,3,8,0.7) 100%)'
                }}
            />
        </div>
    );
}
