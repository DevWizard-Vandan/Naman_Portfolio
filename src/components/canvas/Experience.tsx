'use client';

import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import {
    Environment,
    Stars,
    MeshReflectorMaterial,
    Sparkles
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Suspense } from 'react';
import * as THREE from 'three';
import { Vimana } from './Vimana';

// Temple pillar with ornate details
function TemplePillar({ position, height = 4 }: { position: [number, number, number]; height?: number }) {
    return (
        <RigidBody type="fixed" position={position} colliders="cuboid">
            {/* Base steps */}
            <mesh receiveShadow position={[0, 0.15, 0]}>
                <boxGeometry args={[2.5, 0.3, 2.5]} />
                <meshStandardMaterial color="#1a1520" metalness={0.5} roughness={0.6} />
            </mesh>
            <mesh receiveShadow position={[0, 0.4, 0]}>
                <boxGeometry args={[2.2, 0.2, 2.2]} />
                <meshStandardMaterial color="#1a1520" metalness={0.5} roughness={0.6} />
            </mesh>

            {/* Main pillar body */}
            <mesh castShadow receiveShadow position={[0, height / 2 + 0.5, 0]}>
                <boxGeometry args={[1.4, height, 1.4]} />
                <meshStandardMaterial
                    color="#12101a"
                    emissive="#4f9eff"
                    emissiveIntensity={0.03}
                    metalness={0.7}
                    roughness={0.4}
                />
            </mesh>

            {/* Glowing rune insets */}
            {[0, 1, 2].map((i) => (
                <mesh key={i} position={[0.71, height * 0.3 * (i + 1), 0]}>
                    <boxGeometry args={[0.02, 0.4, 0.2]} />
                    <meshBasicMaterial color="#ffd700" transparent opacity={0.8} toneMapped={false} />
                </mesh>
            ))}
            {[0, 1, 2].map((i) => (
                <mesh key={`b-${i}`} position={[-0.71, height * 0.3 * (i + 1), 0]}>
                    <boxGeometry args={[0.02, 0.4, 0.2]} />
                    <meshBasicMaterial color="#4f9eff" transparent opacity={0.8} toneMapped={false} />
                </mesh>
            ))}

            {/* Ornate capital */}
            <mesh position={[0, height + 0.7, 0]}>
                <boxGeometry args={[2, 0.4, 2]} />
                <meshStandardMaterial
                    color="#1a1520"
                    emissive="#ffd700"
                    emissiveIntensity={0.15}
                    metalness={0.8}
                    roughness={0.3}
                />
            </mesh>

            {/* Top glow line */}
            <mesh position={[0, height + 0.95, 0]}>
                <boxGeometry args={[2.1, 0.1, 2.1]} />
                <meshBasicMaterial color="#ffd700" transparent opacity={0.7} toneMapped={false} />
            </mesh>

            {/* Corner torch */}
            <pointLight
                position={[0, height + 1.5, 0]}
                color="#ff8800"
                intensity={3}
                distance={12}
            />
        </RigidBody>
    );
}

// Floating temple platform with steps
function TemplePlatform({ position, size }: {
    position: [number, number, number];
    size: [number, number, number];
}) {
    return (
        <RigidBody type="fixed" position={position} colliders="cuboid">
            {/* Main platform */}
            <mesh castShadow receiveShadow>
                <boxGeometry args={size} />
                <meshStandardMaterial
                    color="#0a0812"
                    emissive="#4f9eff"
                    emissiveIntensity={0.02}
                    metalness={0.6}
                    roughness={0.35}
                />
            </mesh>

            {/* Edge glow trim */}
            <mesh position={[0, size[1] / 2 + 0.05, 0]}>
                <boxGeometry args={[size[0] + 0.2, 0.1, size[2] + 0.2]} />
                <meshBasicMaterial color="#00ffff" transparent opacity={0.5} toneMapped={false} />
            </mesh>

            {/* Inner glow ring */}
            <mesh position={[0, size[1] / 2 + 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[size[0] * 0.3, size[0] * 0.35, 32]} />
                <meshBasicMaterial color="#ffd700" transparent opacity={0.4} toneMapped={false} />
            </mesh>

            {/* Corner lights */}
            {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
                <pointLight
                    key={i}
                    position={[(size[0] / 2 - 0.5) * x, size[1] / 2 + 0.8, (size[2] / 2 - 0.5) * z]}
                    color="#ff8800"
                    intensity={2}
                    distance={10}
                />
            ))}

            {/* Ambient particles */}
            <Sparkles
                count={20}
                scale={[size[0], 2, size[2]]}
                position={[0, size[1] / 2 + 1, 0]}
                size={1.5}
                speed={0.2}
                color="#ffd700"
                opacity={0.6}
            />
        </RigidBody>
    );
}

// Reflective temple floor
function TempleFloor() {
    return (
        <RigidBody type="fixed" colliders="cuboid">
            {/* Reflective floor - "wet street" effect */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[150, 150]} />
                <MeshReflectorMaterial
                    blur={[300, 100]}
                    resolution={1024}
                    mixBlur={1}
                    mixStrength={50}
                    roughness={0.9}
                    depthScale={1.2}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color="#080810"
                    metalness={0.5}
                    mirror={0.5}
                />
            </mesh>

            {/* Grid lines overlay */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <planeGeometry args={[150, 150, 75, 75]} />
                <meshBasicMaterial
                    color="#4f9eff"
                    wireframe
                    transparent
                    opacity={0.08}
                />
            </mesh>

            {/* Center mandala - concentric rings */}
            {[3, 5, 8, 12].map((radius, i) => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03 + i * 0.005, 0]}>
                    <ringGeometry args={[radius - 0.15, radius, 64]} />
                    <meshBasicMaterial
                        color={i % 2 === 0 ? '#ffd700' : '#4f9eff'}
                        transparent
                        opacity={0.3 - i * 0.05}
                        toneMapped={false}
                    />
                </mesh>
            ))}
        </RigidBody>
    );
}

// Temple obstacles layout
function TempleObstacles() {
    const pillars: { pos: [number, number, number]; height: number }[] = [
        { pos: [-8, 0, -12], height: 6 },
        { pos: [8, 0, -12], height: 6 },
        { pos: [-14, 0, -25], height: 8 },
        { pos: [14, 0, -25], height: 8 },
        { pos: [0, 0, -32], height: 10 },
        { pos: [-7, 0, -45], height: 7 },
        { pos: [7, 0, -45], height: 7 },
        { pos: [-20, 0, -20], height: 5 },
        { pos: [20, 0, -20], height: 5 },
        { pos: [0, 0, -60], height: 12 },
        { pos: [-12, 0, -65], height: 9 },
        { pos: [12, 0, -65], height: 9 },
    ];

    return (
        <>
            {pillars.map((p, i) => (
                <TemplePillar key={i} position={p.pos} height={p.height} />
            ))}

            {/* Floating platforms at various heights */}
            <TemplePlatform position={[-14, 7, -38]} size={[12, 1.5, 12]} />
            <TemplePlatform position={[14, 11, -50]} size={[10, 1.5, 10]} />
            <TemplePlatform position={[0, 18, -70]} size={[16, 2, 16]} />
            <TemplePlatform position={[-22, 5, -55]} size={[8, 1.2, 8]} />
            <TemplePlatform position={[22, 9, -60]} size={[8, 1.2, 8]} />
        </>
    );
}

// Atmospheric lighting
function TempleLighting() {
    return (
        <>
            {/* Deep ambient */}
            <ambientLight intensity={0.06} color="#3a2a5a" />

            {/* Main directional (moonlight) */}
            <directionalLight
                position={[40, 60, 30]}
                intensity={0.35}
                color="#9090ff"
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={150}
                shadow-camera-left={-50}
                shadow-camera-right={50}
                shadow-camera-top={50}
                shadow-camera-bottom={-50}
            />

            {/* Warm temple torches */}
            <pointLight position={[-18, 4, -22]} color="#ff6600" intensity={5} distance={25} />
            <pointLight position={[18, 4, -28]} color="#ff8800" intensity={5} distance={25} />
            <pointLight position={[0, 6, -50]} color="#ffaa00" intensity={6} distance={30} />
            <pointLight position={[-28, 5, -45]} color="#ff7700" intensity={4} distance={22} />
            <pointLight position={[28, 5, -55]} color="#ff9900" intensity={4} distance={22} />

            {/* Cold cyber accents */}
            <pointLight position={[-35, 10, -35]} color="#ff00ff" intensity={3} distance={45} />
            <pointLight position={[35, 12, -45]} color="#00ffff" intensity={3} distance={45} />
            <pointLight position={[0, 25, -80]} color="#4f9eff" intensity={5} distance={60} />
        </>
    );
}

// Post-processing stack
function PostProcessing() {
    return (
        <EffectComposer>
            <Bloom
                intensity={1.8}
                luminanceThreshold={0.15}
                luminanceSmoothing={0.9}
                mipmapBlur
            />
            <Vignette darkness={0.6} offset={0.25} />
        </EffectComposer>
    );
}

export function Experience() {
    return (
        <Canvas
            shadows
            camera={{ position: [0, 5, 15], fov: 60, near: 0.1, far: 500 }}
            gl={{
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.3
            }}
            style={{ background: '#020206' }}
        >
            <Suspense fallback={null}>
                {/* Cosmic starfield */}
                <Stars
                    radius={200}
                    depth={80}
                    count={10000}
                    factor={6}
                    saturation={0.2}
                    fade
                    speed={0.2}
                />

                {/* Environment for reflections */}
                <Environment preset="night" background={false} />

                {/* Physics world */}
                <Physics gravity={[0, -9.81, 0]} debug={false}>
                    <TempleFloor />
                    <TempleObstacles />
                    <Vimana />
                </Physics>

                <TempleLighting />
                <PostProcessing />

                {/* Volumetric fog - hides world edges, makes neon pop */}
                <fog attach="fog" args={['#050508', 5, 80]} />

                {/* Ambient floating particles */}
                <Sparkles
                    count={200}
                    scale={[100, 40, 100]}
                    position={[0, 20, -40]}
                    size={2}
                    speed={0.1}
                    color="#ffd700"
                    opacity={0.4}
                />
            </Suspense>
        </Canvas>
    );
}
