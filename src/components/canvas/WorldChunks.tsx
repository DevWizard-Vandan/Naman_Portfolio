'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Text, Detailed } from '@react-three/drei';
import { RigidBody, CuboidCollider, CylinderCollider, BallCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { ProjectPortal } from './ProjectPortal';
import { InteractionCrystal } from './InteractionCrystal';
import { projects } from '@/data/projects';
import { aboutSections, skills, crystalColors, getSkillById, SkillCategory } from '@/data/user_data';
import { useFlightStore } from '@/store/store';

// Preload temple assets
useGLTF.preload('/models/Temple_Kit.glb');

// ============================================================
// ZONE 0: SPAWN PLATFORM - Landing Pad
// ============================================================
function SpawnZone() {
    const { nodes } = useGLTF('/models/Temple_Kit.glb') as any;
    const platformMesh = nodes?.Platform as THREE.Mesh;

    if (!platformMesh?.geometry?.attributes?.position) return null;

    return (
        <group position={[0, 0, 0]}>
            {/* Main landing platform */}
            <RigidBody type="fixed" colliders={false} position={[0, -8, 0]}>
                <CuboidCollider args={[15, 0.5, 15]} />
                <primitive
                    object={platformMesh.clone()}
                    scale={4}
                    castShadow
                    receiveShadow
                />
                {/* Center beacon */}
                <pointLight
                    position={[0, 3, 0]}
                    color="#00ffff"
                    intensity={5}
                    distance={30}
                />
            </RigidBody>

            {/* Welcome hologram text */}
            <Text
                position={[0, -4, 0]}
                fontSize={1.5}
                color="#ffd700"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
            >
                WELCOME, PILOT
            </Text>

            {/* Subtitle */}
            <Text
                position={[0, -5.5, 0]}
                fontSize={0.5}
                color="#4f9eff"
                anchorX="center"
                anchorY="middle"
                maxWidth={20}
            >
                EXPLORE THE ZONES TO DISCOVER NAMAN'S JOURNEY
            </Text>
        </group>
    );
}

// ============================================================
// ZONE 1: HALL OF HISTORY - Pillar Corridor + About Me Tablets
// ============================================================
function HallOfHistoryZone() {
    const { nodes } = useGLTF('/models/Temple_Kit.glb') as any;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const playerPos = useRef(new THREE.Vector3());
    const { camera } = useThree();

    // 32 pillars total (16 per side)
    const pillarData = useMemo(() => {
        const data: { position: THREE.Vector3; }[] = [];
        const spacing = 12;
        const rowOffset = 18;

        for (let i = 0; i < 16; i++) {
            data.push({ position: new THREE.Vector3(-rowOffset, -5, -50 - i * spacing) });
            data.push({ position: new THREE.Vector3(rowOffset, -5, -50 - i * spacing) });
        }
        return data;
    }, []);

    // Set up instanced mesh matrices
    useEffect(() => {
        if (!meshRef.current) return;

        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3(1.5, 1.5, 1.5);

        pillarData.forEach((pillar, i) => {
            position.copy(pillar.position);
            matrix.compose(position, quaternion, scale);
            meshRef.current!.setMatrixAt(i, matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [pillarData]);

    const pillarMesh = nodes?.Pillar as THREE.Mesh;
    if (!pillarMesh?.geometry?.attributes?.position) return null;

    const pillarMaterial = new THREE.MeshStandardMaterial({
        color: '#1a1520',
        emissive: '#ffd700',
        emissiveIntensity: 0.12,
        metalness: 0.9,
        roughness: 0.2,
    });

    return (
        <group>
            {/* Instanced Pillars */}
            <instancedMesh
                ref={meshRef}
                args={[pillarMesh.geometry, pillarMaterial, pillarData.length]}
                frustumCulled={true}
                castShadow
                receiveShadow
            />

            {/* Physics colliders for pillars (simplified) */}
            {pillarData.filter((_, i) => i % 4 === 0).map((pillar, i) => (
                <RigidBody key={i} type="fixed" position={pillar.position.toArray() as [number, number, number]}>
                    <CylinderCollider args={[6, 1.8]} />
                </RigidBody>
            ))}

            {/* Holographic Stone Tablets */}
            {aboutSections.map((section, i) => (
                <HolographicTablet
                    key={section.id}
                    section={section}
                    position={[0, 5, -70 - i * 40]}
                />
            ))}

            {/* Corridor ambient lights */}
            <pointLight position={[0, 10, -80]} color="#ffd700" intensity={4} distance={50} />
            <pointLight position={[0, 10, -120]} color="#4f9eff" intensity={4} distance={50} />
            <pointLight position={[0, 10, -160]} color="#ff00ff" intensity={4} distance={50} />
        </group>
    );
}

// ============================================================
// HOLOGRAPHIC STONE TABLET - About Me Display
// ============================================================
interface HolographicTabletProps {
    section: typeof aboutSections[0];
    position: [number, number, number];
}

function HolographicTablet({ section, position }: HolographicTabletProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);
    const glowRef = useRef(0.3);
    const { camera } = useThree();

    useFrame(() => {
        if (!meshRef.current || !materialRef.current) return;

        // Calculate distance to player for proximity glow
        const distance = camera.position.distanceTo(meshRef.current.position);
        const targetGlow = distance < 30 ? 0.8 : distance < 50 ? 0.5 : 0.3;

        glowRef.current = THREE.MathUtils.lerp(glowRef.current, targetGlow, 0.05);
        materialRef.current.emissiveIntensity = glowRef.current;
    });

    const color = new THREE.Color(section.glowColor);

    return (
        <group position={position}>
            {/* Main tablet body */}
            <mesh ref={meshRef} castShadow receiveShadow>
                <boxGeometry args={[12, 8, 0.5]} />
                <meshStandardMaterial
                    ref={materialRef}
                    color="#0a0a12"
                    emissive={color}
                    emissiveIntensity={0.3}
                    metalness={0.7}
                    roughness={0.3}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* Edge glow frame */}
            <mesh position={[0, 0, 0.3]}>
                <boxGeometry args={[12.5, 8.5, 0.05]} />
                <meshBasicMaterial
                    color={section.glowColor}
                    transparent
                    opacity={0.4}
                    toneMapped={false}
                />
            </mesh>

            {/* Title text */}
            <Text
                position={[0, 2.5, 0.4]}
                fontSize={0.8}
                color={section.glowColor}
                anchorX="center"
                anchorY="middle"
                maxWidth={10}
            >
                {section.title}
            </Text>

            {/* Content text */}
            <Text
                position={[0, -0.5, 0.4]}
                fontSize={0.4}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                maxWidth={10}
                textAlign="center"
            >
                {section.content}
            </Text>

            {/* Decorative corner glows */}
            {[[-5.5, 3.5], [5.5, 3.5], [-5.5, -3.5], [5.5, -3.5]].map(([x, y], i) => (
                <pointLight
                    key={i}
                    position={[x, y, 1]}
                    color={section.glowColor}
                    intensity={1}
                    distance={5}
                />
            ))}
        </group>
    );
}

// ============================================================
// ZONE 2: SKILL NEBULA - Data Crystals
// ============================================================
function SkillNebulaZone() {
    const { nodes } = useGLTF('/models/Temple_Kit.glb') as any;

    // Group skills by category with positions
    const crystalData = useMemo(() => {
        const data: { skill: typeof skills[0]; position: THREE.Vector3 }[] = [];

        skills.forEach((skill, i) => {
            // Spiral arrangement in the nebula zone
            const angle = (i / skills.length) * Math.PI * 4;
            const radius = 15 + (i % 5) * 8;
            const height = 30 + Math.sin(i * 0.5) * 15;

            data.push({
                skill,
                position: new THREE.Vector3(
                    Math.cos(angle) * radius,
                    height,
                    -250 - Math.sin(angle) * radius - i * 3
                )
            });
        });

        return data;
    }, []);

    // Floating platforms
    const platformMesh = nodes?.Platform as THREE.Mesh;

    return (
        <group>
            {/* Platforms scattered in the nebula */}
            {[
                { pos: [0, 20, -220] as [number, number, number], scale: 2 },
                { pos: [-30, 35, -270] as [number, number, number], scale: 1.5 },
                { pos: [35, 45, -300] as [number, number, number], scale: 1.8 },
                { pos: [0, 55, -340] as [number, number, number], scale: 2.2 },
            ].map((plat, i) => (
                platformMesh?.geometry && (
                    <Detailed key={i} distances={[0, 100, 200]}>
                        {/* High detail */}
                        <RigidBody type="fixed" position={plat.pos}>
                            <CuboidCollider args={[plat.scale * 5, 0.5, plat.scale * 5]} />
                            <primitive
                                object={platformMesh.clone()}
                                scale={plat.scale}
                                castShadow
                            />
                            <pointLight
                                position={[0, 3, 0]}
                                color="#00ffff"
                                intensity={3}
                                distance={20}
                            />
                        </RigidBody>
                        {/* Medium detail */}
                        <mesh position={plat.pos}>
                            <boxGeometry args={[plat.scale * 10, 1, plat.scale * 10]} />
                            <meshStandardMaterial color="#1a1520" />
                        </mesh>
                        {/* Low detail - just a point */}
                        <pointLight position={plat.pos} color="#00ffff" intensity={2} distance={50} />
                    </Detailed>
                )
            ))}

            {/* Data Crystals */}
            {crystalData.map(({ skill, position }) => (
                <DataCrystal
                    key={skill.id}
                    skill={skill}
                    position={position.toArray() as [number, number, number]}
                />
            ))}

            {/* Nebula ambient lighting */}
            <pointLight position={[0, 40, -280]} color="#ff00ff" intensity={6} distance={80} />
            <pointLight position={[-40, 50, -320]} color="#4f9eff" intensity={5} distance={60} />
            <pointLight position={[40, 35, -260]} color="#00ffff" intensity={5} distance={60} />
        </group>
    );
}

// ============================================================
// DATA CRYSTAL - Collectible Skill Display
// ============================================================
interface DataCrystalProps {
    skill: typeof skills[0];
    position: [number, number, number];
}

function DataCrystal({ skill, position }: DataCrystalProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const isCollected = useFlightStore((s) => s.collectedSkills.includes(skill.id));
    const collectSkill = useFlightStore((s) => s.collectSkill);
    const { camera } = useThree();

    const color = crystalColors[skill.category];
    const size = 0.5 + (skill.proficiency / 100) * 0.5; // Size based on proficiency

    useFrame((state, delta) => {
        if (!meshRef.current || isCollected) return;

        // Rotate and bob
        meshRef.current.rotation.y += delta * 0.5;
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.3;

        // Check proximity for collection
        const distance = camera.position.distanceTo(meshRef.current.position);
        if (distance < 5) {
            collectSkill(skill.id);
        }
    });

    if (isCollected) {
        // Show a faint ghost of the collected crystal
        return (
            <mesh position={position}>
                <octahedronGeometry args={[size * 0.5, 0]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.1}
                    wireframe
                />
            </mesh>
        );
    }

    return (
        <group position={position}>
            <mesh ref={meshRef}>
                <octahedronGeometry args={[size, 0]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.8}
                    metalness={0.3}
                    roughness={0.1}
                    transparent
                    opacity={0.9}
                    toneMapped={false}
                />
            </mesh>

            {/* Inner glow */}
            <pointLight
                position={[0, 0, 0]}
                color={color}
                intensity={2}
                distance={8}
            />

            {/* Skill name label */}
            <Text
                position={[0, size + 1, 0]}
                fontSize={0.4}
                color={color}
                anchorX="center"
                anchorY="middle"
            >
                {skill.name}
            </Text>
        </group>
    );
}

// ============================================================
// ZONE 3: PROJECT PEAKS - High Altitude Islands
// ============================================================
function ProjectPeaksZone() {
    const { nodes } = useGLTF('/models/Temple_Kit.glb') as any;
    const platformMesh = nodes?.Platform as THREE.Mesh;

    if (!platformMesh?.geometry?.attributes?.position) return null;

    // Project island positions at high altitude
    const islandData = [
        { projectId: 'drone-nav', position: [0, 60, -420] as [number, number, number], rotation: 0 },
        { projectId: 'brain-tumor', position: [-50, 80, -480] as [number, number, number], rotation: Math.PI / 5 },
        { projectId: 'cyber-vedic', position: [55, 100, -540] as [number, number, number], rotation: -Math.PI / 5 },
    ];

    return (
        <group>
            {islandData.map(({ projectId, position, rotation }) => {
                const project = projects.find(p => p.id === projectId);
                if (!project) return null;

                return (
                    <Detailed key={projectId} distances={[0, 150, 300]}>
                        {/* High detail */}
                        <group position={position} rotation={[0, rotation, 0]}>
                            <RigidBody type="fixed" colliders={false}>
                                <CuboidCollider args={[12, 0.5, 12]} />
                                <primitive
                                    object={platformMesh.clone()}
                                    scale={3}
                                    castShadow
                                    receiveShadow
                                />
                            </RigidBody>
                            <ProjectPortal
                                project={project}
                                position={[0, 3, -5]}
                                scale={2}
                            />
                            <pointLight
                                position={[0, 10, 0]}
                                color={project.color}
                                intensity={5}
                                distance={40}
                            />
                        </group>

                        {/* Medium detail */}
                        <group position={position}>
                            <mesh>
                                <boxGeometry args={[24, 1, 24]} />
                                <meshStandardMaterial color="#1a1520" />
                            </mesh>
                            <pointLight color={project.color} intensity={3} distance={60} />
                        </group>

                        {/* Low detail */}
                        <pointLight position={position} color={project.color} intensity={4} distance={100} />
                    </Detailed>
                );
            })}

            {/* High altitude ambient */}
            <pointLight position={[0, 90, -480]} color="#ffd700" intensity={8} distance={100} />
        </group>
    );
}

// ============================================================
// DEBRIS FIELD - Instanced background rubble
// ============================================================
function DebrisField() {
    const { nodes } = useGLTF('/models/Temple_Kit.glb') as any;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    const debrisData = useMemo(() => {
        const data: { position: THREE.Vector3; rotation: THREE.Euler; scale: number }[] = [];

        for (let i = 0; i < 300; i++) {
            const radius = 100 + Math.random() * 200;
            const theta = Math.random() * Math.PI * 2;
            const depth = -100 - Math.random() * 500;

            data.push({
                position: new THREE.Vector3(
                    Math.cos(theta) * radius,
                    20 + Math.random() * 80,
                    depth
                ),
                rotation: new THREE.Euler(
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2
                ),
                scale: 0.5 + Math.random() * 2
            });
        }
        return data;
    }, []);

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

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.01;
        }
    });

    const rubbleMesh = nodes?.Rubble as THREE.Mesh;
    if (!rubbleMesh?.geometry) return null;

    return (
        <group ref={groupRef}>
            <instancedMesh
                ref={meshRef}
                args={[rubbleMesh.geometry, undefined, debrisData.length]}
                frustumCulled={true}
            >
                <meshStandardMaterial
                    color="#0a0a18"
                    emissive="#4f9eff"
                    emissiveIntensity={0.05}
                    metalness={0.8}
                    roughness={0.3}
                />
            </instancedMesh>
        </group>
    );
}

// ============================================================
// MAIN WORLD CHUNKS COMPONENT
// ============================================================
export function WorldChunks() {
    return (
        <group>
            {/* Zone 0: Spawn */}
            <SpawnZone />

            {/* Zone 1: Hall of History */}
            <HallOfHistoryZone />

            {/* Zone 2: Skill Nebula */}
            <SkillNebulaZone />

            {/* Zone 3: Project Peaks */}
            <ProjectPeaksZone />

            {/* Atmospheric debris throughout */}
            <DebrisField />

            {/* ======================================================== */}
            {/* INTERACTION CRYSTALS - Section Gatekeepers               */}
            {/* ======================================================== */}

            {/* 1. About Me - Before Hall of History */}
            <InteractionCrystal
                position={[0, 8, -30]}
                color="#00ff88"
                section="about"
                title="Pilot Log"
            />

            {/* 2. Skills - Before Nebula */}
            <InteractionCrystal
                position={[0, 20, -230]}
                color="#00ffff"
                section="skills"
                title="Tech Arsenal"
            />

            {/* 3. Contact - Before Peaks */}
            <InteractionCrystal
                position={[0, 50, -380]}
                color="#ff00ff"
                section="contact"
                title="Comms Link"
            />
        </group>
    );
}
