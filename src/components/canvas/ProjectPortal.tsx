'use client';

import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useFlightStore } from '@/store/store';
import { Project } from '@/data/projects';

interface ProjectPortalProps {
    project: Project;
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
}

// Preload will happen in TempleLevel
export function ProjectPortal({
    project,
    position,
    rotation = [0, 0, 0],
    scale = 1
}: ProjectPortalProps) {
    const { nodes } = useGLTF('/models/Temple_Kit.glb') as any;
    const { setCurrentProject, unlockProject } = useFlightStore();
    const portalRef = useRef<THREE.Group>(null);

    const handleEnter = () => {
        unlockProject(project.id);
        setCurrentProject(project.id);
    };

    if (!nodes?.Arch) {
        return null;
    }

    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* The Arch Mesh */}
            <RigidBody type="fixed" colliders="trimesh">
                <primitive
                    object={nodes.Arch.clone()}
                    castShadow
                    receiveShadow
                />
            </RigidBody>

            {/* Sensor Collider - Trigger zone inside the arch */}
            <RigidBody
                type="fixed"
                colliders={false}
                sensor
                onIntersectionEnter={handleEnter}
            >
                <CuboidCollider
                    args={[2, 3, 0.5]}
                    position={[0, 3, 0]}
                    sensor
                />
            </RigidBody>

            {/* Beacon Light - Spotlight glow inside the arch */}
            <spotLight
                position={[0, 6, 0]}
                target-position={[0, 0, 0]}
                color={project.color}
                intensity={8}
                angle={0.8}
                penumbra={0.5}
                distance={20}
            />

            {/* Secondary point light for ambient glow */}
            <pointLight
                position={[0, 3, 0]}
                color={project.color}
                intensity={3}
                distance={15}
            />

            {/* Floating label above the arch */}
            <mesh position={[0, 8, 0]}>
                <planeGeometry args={[6, 1]} />
                <meshBasicMaterial
                    color={project.color}
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}
