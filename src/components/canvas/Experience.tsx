'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import {
    Environment,
    Stars,
    MeshReflectorMaterial,
    Sparkles
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { Vimana } from './Vimana';
import { WorldChunks } from './WorldChunks';
import { PerformanceOptimizer, useAdaptiveBloom } from './PerformanceOptimizer';
import { useFlightStore } from '@/store/store';

// ============================================================
// REFLECTIVE TEMPLE FLOOR
// ============================================================
function TempleFloor() {
    const ringRefs = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!ringRefs.current) return;
        const time = state.clock.elapsedTime;

        ringRefs.current.children.forEach((child, i) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
                const pulse = 0.5 + Math.sin(time * 2 + i * 0.5) * 0.2;
                child.material.opacity = (0.5 - (i % 6) * 0.05) * pulse;
            }
        });
    });

    return (
        <RigidBody type="fixed" colliders={false}>
            <CuboidCollider args={[200, 0.5, 600]} position={[0, -0.5, -200]} />

            {/* Reflective floor */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -200]}>
                <planeGeometry args={[400, 1200]} />
                <MeshReflectorMaterial
                    blur={[400, 200]}
                    resolution={1024}
                    mixBlur={1}
                    mixStrength={80}
                    roughness={0.85}
                    depthScale={1.5}
                    minDepthThreshold={0.3}
                    maxDepthThreshold={1.6}
                    color="#040408"
                    metalness={0.6}
                    mirror={0.7}
                />
            </mesh>

            {/* Grid lines overlay */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -200]}>
                <planeGeometry args={[400, 1200, 200, 600]} />
                <meshBasicMaterial
                    color="#4f9eff"
                    wireframe
                    transparent
                    opacity={0.08}
                />
            </mesh>

            {/* Center mandala rings */}
            <group ref={ringRefs}>
                {[2, 4, 6, 9, 13, 18].map((radius, i) => (
                    <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03 + i * 0.005, 0]}>
                        <ringGeometry args={[radius - 0.2, radius, 64]} />
                        <meshBasicMaterial
                            color={i % 3 === 0 ? '#ffd700' : i % 3 === 1 ? '#00ffff' : '#ff00ff'}
                            transparent
                            opacity={0.5 - i * 0.05}
                            toneMapped={false}
                        />
                    </mesh>
                ))}
            </group>
        </RigidBody>
    );
}

// ============================================================
// DRAMATIC ATMOSPHERIC LIGHTING
// ============================================================
function WorldLighting() {
    return (
        <>
            {/* Deep cosmic ambient */}
            <ambientLight intensity={0.06} color="#2a1a4a" />

            {/* Main directional (moonlight) */}
            <directionalLight
                position={[50, 100, 40]}
                intensity={0.4}
                color="#8080ff"
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={400}
                shadow-camera-left={-150}
                shadow-camera-right={150}
                shadow-camera-top={150}
                shadow-camera-bottom={-150}
            />

            {/* Zone-specific lighting is handled within WorldChunks */}
        </>
    );
}

// ============================================================
// ADAPTIVE POST-PROCESSING
// ============================================================
function PostProcessing() {
    const bloomEnabled = useAdaptiveBloom();

    return (
        <EffectComposer>
            {bloomEnabled && (
                <Bloom
                    intensity={2.5}
                    luminanceThreshold={0.1}
                    luminanceSmoothing={0.95}
                    mipmapBlur
                />
            )}
            <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={[0.0008, 0.0008]}
            />
            <Vignette darkness={0.7} offset={0.2} />
        </EffectComposer>
    );
}

// ============================================================
// MAIN EXPERIENCE COMPONENT
// ============================================================
export function Experience() {
    const gamePhase = useFlightStore((s) => s.gamePhase);

    // Don't render 3D world until game has started
    if (gamePhase === 'hangar') return null;

    return (
        <Canvas
            shadows
            camera={{ position: [0, 5, 15], fov: 60, near: 0.1, far: 1000 }}
            gl={{
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.3
            }}
            style={{ background: '#020206' }}
        >
            <Suspense fallback={null}>
                {/* Performance-adaptive wrapper */}
                <PerformanceOptimizer>
                    {/* Dense cosmic starfield */}
                    <Stars
                        radius={500}
                        depth={200}
                        count={20000}
                        factor={10}
                        saturation={0.3}
                        fade
                        speed={0.1}
                    />

                    {/* Environment for reflections */}
                    <Environment preset="night" background={false} />

                    {/* Physics world */}
                    <Physics gravity={[0, -9.81, 0]} debug={false}>
                        <TempleFloor />
                        <WorldChunks />
                        <Vimana />
                    </Physics>

                    <WorldLighting />
                    <PostProcessing />

                    {/* Atmospheric fog - extended for large world */}
                    <fog attach="fog" args={['#030310', 30, 400]} />

                    {/* Ambient particles - scaled for zones */}
                    <Sparkles
                        count={500}
                        scale={[200, 100, 600]}
                        position={[0, 50, -250]}
                        size={3}
                        speed={0.05}
                        color="#ffd700"
                        opacity={0.5}
                    />

                    <Sparkles
                        count={300}
                        scale={[250, 120, 700]}
                        position={[0, 60, -350]}
                        size={2}
                        speed={0.03}
                        color="#00ffff"
                        opacity={0.3}
                    />

                    <Sparkles
                        count={200}
                        scale={[150, 80, 400]}
                        position={[-50, 70, -400]}
                        size={2.5}
                        speed={0.08}
                        color="#ff00ff"
                        opacity={0.4}
                    />
                </PerformanceOptimizer>
            </Suspense>
        </Canvas>
    );
}
