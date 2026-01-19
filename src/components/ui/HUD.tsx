'use client';

import { useFlightStore } from '@/store/store';

export function HUD() {
    const { altitude, speed, isBoostActive } = useFlightStore();

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
