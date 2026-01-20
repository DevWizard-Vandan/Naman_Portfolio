'use client';

import { useEffect, useState } from 'react';
import { useFlightStore } from '@/store/store';
import { getSkillById, crystalColors } from '@/data/user_data';

// ============================================================
// SKILL COLLECTION TOAST
// Shows when a skill crystal is collected
// ============================================================
function SkillCollectionToast() {
    const lastCollectedSkill = useFlightStore((s) => s.lastCollectedSkill);
    const clearLastCollectedSkill = useFlightStore((s) => s.clearLastCollectedSkill);
    const [visible, setVisible] = useState(false);
    const [skill, setSkill] = useState<ReturnType<typeof getSkillById>>(undefined);

    useEffect(() => {
        if (lastCollectedSkill) {
            const foundSkill = getSkillById(lastCollectedSkill);
            if (foundSkill) {
                setSkill(foundSkill);
                setVisible(true);

                // Play collection sound (optional - browser audio)
                try {
                    const audio = new Audio('/sounds/collect.mp3');
                    audio.volume = 0.3;
                    audio.play().catch(() => { }); // Ignore if no audio file
                } catch { }

                // Hide after delay
                const timer = setTimeout(() => {
                    setVisible(false);
                    clearLastCollectedSkill();
                }, 2500);

                return () => clearTimeout(timer);
            }
        }
    }, [lastCollectedSkill, clearLastCollectedSkill]);

    if (!visible || !skill) return null;

    const color = crystalColors[skill.category];

    return (
        <div
            className="fixed top-1/3 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-bounce"
            style={{
                animation: 'skillCollect 0.5s ease-out'
            }}
        >
            <div
                className="px-6 py-3 rounded-lg border"
                style={{
                    background: `linear-gradient(135deg, ${color}20, transparent)`,
                    borderColor: color,
                    boxShadow: `0 0 30px ${color}40`
                }}
            >
                <p
                    className="text-lg font-bold tracking-wider uppercase"
                    style={{ color, textShadow: `0 0 10px ${color}` }}
                >
                    + {skill.name}
                </p>
                <p className="text-xs text-white/60 uppercase tracking-widest mt-1">
                    SKILL ACQUIRED
                </p>
            </div>

            <style jsx>{`
                @keyframes skillCollect {
                    0% { transform: translateX(-50%) scale(0.5); opacity: 0; }
                    50% { transform: translateX(-50%) scale(1.1); }
                    100% { transform: translateX(-50%) scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

// ============================================================
// SKILL COUNTER
// Shows collected skills count in corner
// ============================================================
function SkillCounter() {
    const collectedSkills = useFlightStore((s) => s.collectedSkills);
    const totalSkills = 20; // From user_data.ts

    if (collectedSkills.length === 0) return null;

    return (
        <div className="absolute bottom-6 right-6 hud-panel p-3 rounded-lg">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 relative">
                    {/* Crystal icon */}
                    <svg viewBox="0 0 24 24" className="w-full h-full text-cyan-400">
                        <polygon
                            points="12,2 22,12 12,22 2,12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                    </svg>
                </div>
                <span className="text-cyan-400 font-mono text-sm">
                    {collectedSkills.length}/{totalSkills}
                </span>
            </div>
        </div>
    );
}

// ============================================================
// OPTIMIZATION INDICATOR
// Shows when performance mode is adjusting
// ============================================================
function OptimizationIndicator() {
    const isOptimizing = useFlightStore((s) => s.isOptimizing);
    const performanceMode = useFlightStore((s) => s.performanceMode);

    if (!isOptimizing) return null;

    return (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
            <div
                className="px-4 py-2 bg-black/80 border border-cyan-500/50 rounded"
                style={{
                    animation: 'glitch 0.3s infinite'
                }}
            >
                <p className="text-cyan-400 text-xs font-mono tracking-wider uppercase">
                    SYSTEM OPTIMIZING... [{performanceMode.toUpperCase()}]
                </p>
            </div>

            <style jsx>{`
                @keyframes glitch {
                    0% { transform: translateX(-50%); }
                    20% { transform: translateX(-50%) skewX(-2deg); }
                    40% { transform: translateX(-50%) skewX(2deg); }
                    60% { transform: translateX(-50%) skewX(-1deg); }
                    80% { transform: translateX(-50%) skewX(1deg); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}

// ============================================================
// MAIN HUD COMPONENT
// ============================================================
export function HUD() {
    const { altitude, speed, isBoostActive } = useFlightStore();
    const gamePhase = useFlightStore((s) => s.gamePhase);

    // Don't show HUD until game is playing
    if (gamePhase !== 'playing') return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-10">
            {/* Top-left: Flight telemetry */}
            <div className="absolute top-6 left-6 hud-panel p-4 rounded-lg min-w-[200px]">
                <div className="text-xs text-cyan-400/60 uppercase tracking-widest mb-2">
                    Flight Systems
                </div>

                <div className="space-y-2">
                    {/* Altitude */}
                    <div className="flex justify-between items-center">
                        <span className="text-cyan-400/80 text-sm">ALTITUDE</span>
                        <span className="text-cyber-blue font-bold hud-text">
                            {altitude.toFixed(1)}
                            <span className="text-xs text-cyan-400/60 ml-1">m</span>
                        </span>
                    </div>

                    {/* Speed */}
                    <div className="flex justify-between items-center">
                        <span className="text-cyan-400/80 text-sm">VELOCITY</span>
                        <span className="text-cyber-blue font-bold hud-text">
                            {speed.toFixed(1)}
                            <span className="text-xs text-cyan-400/60 ml-1">m/s</span>
                        </span>
                    </div>

                    {/* Speed bar */}
                    <div className="h-1 bg-cyan-900/30 rounded-full overflow-hidden mt-1">
                        <div
                            className="h-full bg-gradient-to-r from-cyber-blue to-neon-cyan transition-all duration-100"
                            style={{ width: `${Math.min(100, speed * 5)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Top-right: System status */}
            <div className="absolute top-6 right-6 hud-panel p-4 rounded-lg">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isBoostActive ? 'bg-yellow-400' : 'bg-green-400'} pulse-glow`} />
                    <span className="text-green-400 text-sm uppercase tracking-wider">
                        {isBoostActive ? 'BOOST ACTIVE' : 'SYSTEMS ONLINE'}
                    </span>
                </div>
            </div>

            {/* Bottom: Controls hint */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hud-panel px-6 py-3 rounded-full">
                <div className="flex gap-6 text-xs text-cyan-400/60 uppercase">
                    <span><kbd className="text-cyber-blue">W</kbd> Thrust</span>
                    <span><kbd className="text-cyber-blue">S</kbd> Brake</span>
                    <span><kbd className="text-cyber-blue">A/D</kbd> Turn</span>
                    <span><kbd className="text-cyber-blue">Space</kbd> Boost</span>
                    <span><kbd className="text-cyber-blue">G</kbd> Gear</span>
                </div>
            </div>

            {/* Center crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative w-8 h-8">
                    <div className="absolute top-1/2 left-0 w-2 h-[1px] bg-cyan-400/50" />
                    <div className="absolute top-1/2 right-0 w-2 h-[1px] bg-cyan-400/50" />
                    <div className="absolute left-1/2 top-0 w-[1px] h-2 bg-cyan-400/50" />
                    <div className="absolute left-1/2 bottom-0 w-[1px] h-2 bg-cyan-400/50" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-cyan-400/30" />
                </div>
            </div>

            {/* Skill collection toast */}
            <SkillCollectionToast />

            {/* Skill counter */}
            <SkillCounter />

            {/* Optimization indicator */}
            <OptimizationIndicator />

            {/* Vignette effect */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(5,5,8,0.8) 100%)'
                }}
            />
        </div>
    );
}
