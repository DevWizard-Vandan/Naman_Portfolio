'use client';

import { useRef, useState, useEffect, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useProgress, useGLTF, Environment, SpotLight } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useFlightStore } from '@/store/store';
import * as THREE from 'three';

// Preload the Vimana model
useGLTF.preload('/models/vimana.glb', 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

// ============================================================
// HANGAR VIMANA - Stationary version with idle animations
// ============================================================
function HangarVimana() {
    const { nodes, materials } = useGLTF('/models/vimana.glb', 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/') as any;
    const innerRingRef = useRef<THREE.Object3D>(null);
    const outerRingRef = useRef<THREE.Object3D>(null);
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        const time = state.clock.elapsedTime;

        // Slow idle ring rotation
        if (innerRingRef.current) {
            innerRingRef.current.rotation.y += 0.3 * delta;
        }
        if (outerRingRef.current) {
            outerRingRef.current.rotation.y -= 0.2 * delta;
        }

        // Gentle hover bob
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(time * 1.5) * 0.05;
            groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.02;
        }
    });

    const chassisMaterial = new THREE.MeshStandardMaterial({
        color: '#1a1a2e',
        emissive: '#4f9eff',
        emissiveIntensity: 0.15,
        metalness: 0.8,
        roughness: 0.3
    });

    const ringMaterial = new THREE.MeshStandardMaterial({
        color: '#ffd700',
        emissive: '#ffd700',
        emissiveIntensity: 0.6,
        metalness: 0.9,
        roughness: 0.1,
        toneMapped: false
    });

    if (!nodes) return null;

    return (
        <group ref={groupRef} position={[0, -0.5, 0]} rotation-y={Math.PI / 4} scale={0.6}>
            {nodes.chassis && (
                <primitive
                    object={nodes.chassis.clone()}
                    material={chassisMaterial}
                    castShadow
                    receiveShadow
                />
            )}
            {nodes.inner_ring && (
                <primitive
                    ref={innerRingRef}
                    object={nodes.inner_ring.clone()}
                    material={ringMaterial}
                />
            )}
            {nodes.outer_ring && (
                <primitive
                    ref={outerRingRef}
                    object={nodes.outer_ring.clone()}
                    material={ringMaterial}
                />
            )}

            {/* Engine core glow */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshBasicMaterial
                    color="#00ffff"
                    transparent
                    opacity={0.7}
                    toneMapped={false}
                />
            </mesh>

            {/* Core light */}
            <pointLight
                position={[0, 0, 0]}
                color="#4f9eff"
                intensity={3}
                distance={10}
            />
        </group>
    );
}

// ============================================================
// HANGAR ENVIRONMENT - Dark bay with dramatic spotlights
// ============================================================
function HangarEnvironment() {
    return (
        <>
            {/* Dark floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial
                    color="#050508"
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {/* Grid lines on floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.98, 0]}>
                <planeGeometry args={[20, 20, 20, 20]} />
                <meshBasicMaterial
                    color="#4f9eff"
                    wireframe
                    transparent
                    opacity={0.1}
                />
            </mesh>

            {/* Ceiling glow ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
                <ringGeometry args={[2, 2.5, 32]} />
                <meshBasicMaterial
                    color="#ffd700"
                    transparent
                    opacity={0.3}
                    toneMapped={false}
                />
            </mesh>

            {/* Main spotlight from above */}
            <SpotLight
                position={[0, 8, 0]}
                angle={0.4}
                penumbra={0.8}
                intensity={50}
                color="#ffd700"
                castShadow
                distance={20}
            />

            {/* Side accent lights */}
            <SpotLight
                position={[-5, 4, 3]}
                angle={0.5}
                penumbra={1}
                intensity={20}
                color="#4f9eff"
                distance={15}
            />
            <SpotLight
                position={[5, 4, 3]}
                angle={0.5}
                penumbra={1}
                intensity={20}
                color="#ff00ff"
                distance={15}
            />

            {/* Ambient */}
            <ambientLight intensity={0.05} color="#1a1a2e" />
        </>
    );
}

// ============================================================
// CAMERA CONTROLLER - Handles transition zoom
// ============================================================
function CameraController({ isTransitioning }: { isTransitioning: boolean }) {
    const { camera } = useThree();
    const targetPos = useRef(new THREE.Vector3(0, 1, 6));

    useFrame((_, delta) => {
        if (isTransitioning) {
            // Zoom into the Vimana
            targetPos.current.lerp(new THREE.Vector3(0, 0.5, 1), 3 * delta);
        }
        camera.position.lerp(targetPos.current, 2 * delta);
        camera.lookAt(0, 0, 0);
    });

    return null;
}

// ============================================================
// HANGAR POST PROCESSING
// ============================================================
function HangarPostProcessing() {
    return (
        <EffectComposer>
            <Bloom
                intensity={1.5}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                mipmapBlur
            />
            <Vignette darkness={0.8} offset={0.2} />
        </EffectComposer>
    );
}

// ============================================================
// MAIN LOADING SCREEN COMPONENT
// ============================================================
export function LoadingScreen() {
    const { progress, active } = useProgress();
    const [isReady, setIsReady] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const setGamePhase = useFlightStore((s) => s.setGamePhase);

    // Check when loading is complete
    useEffect(() => {
        if (progress >= 100 && !active) {
            // Small delay for polish
            const timer = setTimeout(() => setIsReady(true), 500);
            return () => clearTimeout(timer);
        }
    }, [progress, active]);

    // Handle launch button click
    const handleLaunch = useCallback(() => {
        if (isTransitioning) return;

        setIsTransitioning(true);
        // Transition duration before switching to game
        setTimeout(() => {
            setGamePhase('playing');
        }, 1500);
    }, [isTransitioning, setGamePhase]);

    // Listen for E or Enter keys
    useEffect(() => {
        if (!isReady || isTransitioning) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Enter' || e.code === 'KeyE') {
                handleLaunch();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isReady, isTransitioning, handleLaunch]);

    // Hide when game has started
    const gamePhase = useFlightStore((s) => s.gamePhase);
    if (gamePhase === 'playing') return null;

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {/* 3D Hangar Scene */}
            <Canvas
                shadows
                camera={{ position: [0, 1, 6], fov: 50 }}
                gl={{
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.2
                }}
            >
                <Suspense fallback={null}>
                    <HangarVimana />
                    <HangarEnvironment />
                    <CameraController isTransitioning={isTransitioning} />
                    <HangarPostProcessing />
                    <Environment preset="night" background={false} />
                    <fog attach="fog" args={['#000000', 5, 25]} />
                </Suspense>
            </Canvas>

            {/* UI Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between py-12">
                {/* Top: Title */}
                <div className="text-center">
                    <h1
                        className="text-5xl tracking-[0.5em] uppercase"
                        style={{
                            fontFamily: 'Cinzel, serif',
                            color: '#ffd700',
                            textShadow: '0 0 30px rgba(255, 215, 0, 0.5), 0 0 60px rgba(255, 215, 0, 0.2)'
                        }}
                    >
                        VIMANA
                    </h1>
                    <p
                        className="text-sm tracking-[0.3em] mt-3 uppercase"
                        style={{
                            fontFamily: 'Cinzel, serif',
                            color: 'rgba(79, 158, 255, 0.7)'
                        }}
                    >
                        NAMAN SHARMA • FULL-STACK SYSTEMS
                    </p>
                </div>

                {/* Center: Status text (only during loading) */}
                {!isReady && (
                    <div className="text-center">
                        <div className="flex items-center gap-3 mb-3">
                            {/* Scan line animation */}
                            <div className="w-32 h-[2px] bg-gray-800 rounded overflow-hidden relative">
                                <div
                                    className="absolute h-full bg-cyan-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                                <div
                                    className="absolute h-full w-8 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"
                                    style={{ left: `${progress - 10}%` }}
                                />
                            </div>
                            <span className="text-cyan-500/70 font-mono text-sm">
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <p className="text-cyan-400/50 text-xs tracking-widest uppercase font-mono">
                            CALIBRATING FLIGHT SYSTEMS...
                        </p>
                    </div>
                )}

                {/* Bottom: Launch button (only when ready) */}
                <div className="h-16 flex items-center justify-center">
                    {isReady && !isTransitioning && (
                        <button
                            onClick={handleLaunch}
                            className="pointer-events-auto group relative px-10 py-4 border border-amber-500/50 
                                       bg-amber-500/5 hover:bg-amber-500/15 transition-all duration-300
                                       hover:border-amber-400 hover:shadow-[0_0_30px_rgba(255,215,0,0.3)]"
                            style={{ fontFamily: 'Cinzel, serif' }}
                        >
                            <span className="text-amber-400 tracking-[0.3em] uppercase text-sm group-hover:text-amber-300">
                                PRESS <span className="text-white font-bold mx-1">E</span> OR <span className="text-white font-bold mx-1">ENTER</span> TO INITIALIZE SYSTEMS
                            </span>
                            {/* Corner accents */}
                            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-amber-400/70" />
                            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-amber-400/70" />
                            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-amber-400/70" />
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-amber-400/70" />
                        </button>
                    )}

                    {isTransitioning && (
                        <p
                            className="text-amber-400 tracking-[0.4em] uppercase text-sm animate-pulse"
                            style={{ fontFamily: 'Cinzel, serif' }}
                        >
                            ENGAGING...
                        </p>
                    )}
                </div>
            </div>

            {/* Scan line effect overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.03) 2px, rgba(0,255,255,0.03) 4px)'
                }}
            />

            {/* Transition fade */}
            <div
                className={`absolute inset-0 bg-black pointer-events-none transition-opacity duration-1000 ${isTransitioning ? 'opacity-100' : 'opacity-0'
                    }`}
            />
        </div>
    );
}
