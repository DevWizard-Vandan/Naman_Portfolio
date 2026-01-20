'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { ProjectPortal } from './ProjectPortal';
import { projects } from '@/data/projects';

// Preload the temple assets
useGLTF.preload('/models/Temple_Kit.glb');

// ============================================================
// DEBRIS FIELD - Slowly rotating rubble using InstancedMesh
// ============================================================
function DebrisField() {
    const { nodes } = useGLTF('/models/Temple_Kit.glb') as any;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    // Generate random positions for debris - reduced count for stability
    const debrisData = useMemo(() => {
        const data: { position: THREE.Vector3; rotation: THREE.Euler; scale: number }[] = [];
        for (let i = 0; i < 200; i++) { // Reduced from 500 for performance
            const radius = 80 + Math.random() * 120;
            const theta = Math.random() * Math.PI * 2;
            const phi = (Math.random() - 0.5) * Math.PI * 0.5;

            data.push({
                position: new THREE.Vector3(
                    Math.cos(theta) * Math.cos(phi) * radius,
                    Math.sin(phi) * radius + 30,
                    Math.sin(theta) * Math.cos(phi) * radius - 60
                ),
                rotation: new THREE.Euler(
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2
                ),
                scale: 0.5 + Math.random() * 1.5
            });
        }
        return data;
    }, []);

    // Set up instanced mesh matrices
    useEffect(() => {
        if (!meshRef.current) return;

        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        debrisData.forEach((debris, i) => {
            position.copy(debris.position);
            quaternion.setFromEuler(debris.rotation);
            scale.setScalar(debris.scale);
            matrix.compose(position, quaternion, scale);
            meshRef.current!.setMatrixAt(i, matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [debrisData]);

    // Slow rotation of entire debris field
    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.015;
        }
    });

    // Don't render until model is loaded
    const rubbleMesh = nodes?.Rubble as THREE.Mesh;
    if (!rubbleMesh?.geometry) return null;

    return (
        <group ref={groupRef}>
            <instancedMesh
                ref={meshRef}
                args={[rubbleMesh.geometry, undefined, debrisData.length]}
                frustumCulled={false}
            >
                <meshStandardMaterial
                    color="#0a0a18"
                    emissive="#4f9eff"
                    emissiveIntensity={0.08}
                    metalness={0.8}
                    roughness={0.3}
                    toneMapped={false}
                />
            </instancedMesh>
        </group>
    );
}

// ============================================================
// PILLAR RUNWAY - Two rows of pillars (simple approach)
// ============================================================
function PillarRunway() {
    const { nodes } = useGLTF('/models/Temple_Kit.glb') as any;

    const pillarData = useMemo(() => {
        const data: { position: [number, number, number]; scale: number }[] = [];
        const spacing = 10;
        const rowOffset = 14;

        for (let i = 0; i < 8; i++) {
            data.push({ position: [-rowOffset, -5, -i * spacing - 20], scale: 1.2 });
            data.push({ position: [rowOffset, -5, -i * spacing - 20], scale: 1.2 });
        }
        return data;
    }, []);

    const pillarMesh = nodes?.Pillar as THREE.Mesh;
    if (!pillarMesh) return null;

    // Create emissive material for pillars
    const pillarMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#1a1520',
        emissive: '#ffd700',
        emissiveIntensity: 0.15,
        metalness: 0.9,
        roughness: 0.2,
    }), []);

    return (
        <group>
            {pillarData.map((pillar, i) => (
                <RigidBody key={i} type="fixed" colliders="hull" position={pillar.position}>
                    <mesh
                        geometry={pillarMesh.geometry}
                        material={pillarMaterial}
                        scale={pillar.scale}
                        castShadow
                        receiveShadow
                    />
                    {/* Pillar base glow */}
                    <pointLight
                        position={[0, 0.5, 0]}
                        color="#ffd700"
                        intensity={0.8}
                        distance={8}
                    />
                </RigidBody>
            ))}
        </group>
    );
}

// ============================================================
// PROJECT ISLAND - Platform + Portal combination
// ============================================================
interface ProjectIslandProps {
    position: [number, number, number];
    projectId: string;
    rotation?: number;
}

function ProjectIsland({ position, projectId, rotation = 0 }: ProjectIslandProps) {
    const { nodes } = useGLTF('/models/Temple_Kit.glb') as any;
    const project = projects.find(p => p.id === projectId);

    const platformMesh = nodes?.Platform as THREE.Mesh;
    if (!platformMesh || !project) return null;

    return (
        <group position={position} rotation={[0, rotation, 0]}>
            {/* Platform base */}
            <RigidBody type="fixed" colliders="trimesh">
                <primitive
                    object={platformMesh.clone()}
                    scale={2.5}
                    castShadow
                    receiveShadow
                />
            </RigidBody>

            {/* Project Portal (Arch) */}
            <ProjectPortal
                project={project}
                position={[0, 3, -4]}
                scale={1.8}
            />

            {/* Beacon light */}
            <pointLight
                position={[0, 8, 0]}
                color={project.color}
                intensity={3}
                distance={30}
            />
        </group>
    );
}

// ============================================================
// SPAWN PLATFORM - Starting area
// ============================================================
function SpawnPlatform() {
    const { nodes } = useGLTF('/models/Temple_Kit.glb') as any;

    const platformMesh = nodes?.Platform as THREE.Mesh;
    if (!platformMesh) return null;

    return (
        <RigidBody type="fixed" colliders="trimesh" position={[0, -8, 0]}>
            <primitive
                object={platformMesh.clone()}
                scale={3}
                castShadow
                receiveShadow
            />
            <pointLight
                position={[0, 3, 0]}
                color="#00ffff"
                intensity={4}
                distance={25}
            />
        </RigidBody>
    );
}

// ============================================================
// MAIN TEMPLE LEVEL COMPONENT
// ============================================================
export function TempleLevel() {
    return (
        <group>
            {/* Starting Platform */}
            <SpawnPlatform />

            {/* Runway Pillars */}
            <PillarRunway />

            {/* Project Islands - positioned for progressive difficulty */}
            <ProjectIsland
                position={[0, 12, -60]}
                projectId="drone-nav"
                rotation={0}
            />

            <ProjectIsland
                position={[-45, 35, -120]}
                projectId="brain-tumor"
                rotation={Math.PI / 5}
            />

            <ProjectIsland
                position={[50, 55, -180]}
                projectId="cyber-vedic"
                rotation={-Math.PI / 5}
            />

            {/* Debris Field - Background atmosphere */}
            <DebrisField />
        </group>
    );
}
