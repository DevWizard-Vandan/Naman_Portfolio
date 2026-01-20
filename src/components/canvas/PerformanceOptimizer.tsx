'use client';

import { useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { useFlightStore } from '@/store/store';

// ============================================================
// PERFORMANCE OPTIMIZER
// Uses drei's PerformanceMonitor to dynamically adjust quality
// ============================================================
interface PerformanceOptimizerProps {
    children: React.ReactNode;
}

export function PerformanceOptimizer({ children }: PerformanceOptimizerProps) {
    const setPerformanceMode = useFlightStore((s) => s.setPerformanceMode);
    const setOptimizing = useFlightStore((s) => s.setOptimizing);
    const performanceMode = useFlightStore((s) => s.performanceMode);

    const { gl } = useThree();
    const lastModeRef = useRef(performanceMode);
    const cooldownRef = useRef(false);

    // Handle performance decline (FPS too low)
    const handleDecline = useCallback(() => {
        if (cooldownRef.current) return;

        cooldownRef.current = true;
        setOptimizing(true);

        if (lastModeRef.current === 'high') {
            setPerformanceMode('medium');
            lastModeRef.current = 'medium';
            gl.setPixelRatio(1);
        } else if (lastModeRef.current === 'medium') {
            setPerformanceMode('low');
            lastModeRef.current = 'low';
            gl.setPixelRatio(0.5);
        }

        // Clear optimizing state and cooldown after a delay
        setTimeout(() => {
            setOptimizing(false);
            cooldownRef.current = false;
        }, 2000);
    }, [setPerformanceMode, setOptimizing, gl]);

    // Handle performance improvement (FPS high enough)
    const handleIncline = useCallback(() => {
        if (cooldownRef.current) return;

        cooldownRef.current = true;
        setOptimizing(true);

        if (lastModeRef.current === 'low') {
            setPerformanceMode('medium');
            lastModeRef.current = 'medium';
            gl.setPixelRatio(1);
        } else if (lastModeRef.current === 'medium') {
            setPerformanceMode('high');
            lastModeRef.current = 'high';
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }

        setTimeout(() => {
            setOptimizing(false);
            cooldownRef.current = false;
        }, 2000);
    }, [setPerformanceMode, setOptimizing, gl]);

    return (
        <PerformanceMonitor
            onDecline={handleDecline}
            onIncline={handleIncline}
            flipflops={3}  // Number of flips before giving up
            factor={0.5}   // Factor for threshold calculation
            bounds={(fps) => [30, 50]} // [min, max] FPS thresholds
        >
            {children}
        </PerformanceMonitor>
    );
}

// ============================================================
// PERFORMANCE HUD INDICATOR
// Shows "SYSTEM OPTIMIZING..." when adjusting quality
// ============================================================
export function PerformanceIndicator() {
    const isOptimizing = useFlightStore((s) => s.isOptimizing);
    const performanceMode = useFlightStore((s) => s.performanceMode);

    if (!isOptimizing) return null;

    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
            <div
                className="px-6 py-3 bg-black/80 border border-cyan-500/50 rounded"
                style={{
                    animation: 'glitch 0.3s infinite',
                    textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
                }}
            >
                <p className="text-cyan-400 text-sm font-mono tracking-wider uppercase">
                    SYSTEM OPTIMIZING...
                </p>
                <p className="text-cyan-400/60 text-xs font-mono mt-1">
                    MODE: {performanceMode.toUpperCase()}
                </p>
            </div>

            {/* CSS for glitch animation */}
            <style jsx>{`
                @keyframes glitch {
                    0% { transform: translate(0); }
                    20% { transform: translate(-2px, 1px); }
                    40% { transform: translate(2px, -1px); }
                    60% { transform: translate(-1px, 2px); }
                    80% { transform: translate(1px, -2px); }
                    100% { transform: translate(0); }
                }
            `}</style>
        </div>
    );
}

// ============================================================
// ADAPTIVE BLOOM - Conditionally renders based on performance
// ============================================================
export function useAdaptiveBloom() {
    const bloomEnabled = useFlightStore((s) => s.bloomEnabled);
    return bloomEnabled;
}
