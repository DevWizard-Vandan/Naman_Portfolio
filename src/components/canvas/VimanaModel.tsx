'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface VimanaModelProps {
    thrustActive: boolean;
    boostActive: boolean;
    altitude: number;
    distanceToGround: number;
    strafeDirection: number;
    isGearDeployed: boolean; // Manual state
}

// Preload the model with Draco decoder
useGLTF.preload('/models/vimana.glb', 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

export function VimanaModel({
    thrustActive,
    boostActive,
    altitude,
    distanceToGround,
    strafeDirection,
    isGearDeployed
}: VimanaModelProps) {
    // Load the GLTF model with Draco support
    const { nodes, materials } = useGLTF('/models/vimana.glb', 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/') as any;

    // Refs for animated parts
    const innerRingRef = useRef<THREE.Object3D>(null);
    const outerRingRef = useRef<THREE.Object3D>(null);
    const legBackRef = useRef<THREE.Object3D>(null);
    const legLeftRef = useRef<THREE.Object3D>(null);
    const legRightRef = useRef<THREE.Object3D>(null);
    const chassisRef = useRef<THREE.Group>(null);

    // Smooth values for interpolation
    const smoothLegAngle = useRef(0);
    const smoothEmissive = useRef(0.5);

    // Animation constants
    const BASE_RING_SPEED = 0.8;
    const THRUST_RING_MULTIPLIER = 5;
    const LEG_RETRACT_ALTITUDE = 3;
    const LEG_RETRACT_ANGLE = -Math.PI / 3; // -60 degrees (tucked in)
    const LEG_EXTENDED_ANGLE = 0; // Default extended position

    useFrame((state, delta) => {
        const time = state.clock.elapsedTime;

        // Calculate ring speed multiplier
        const speedMultiplier = (thrustActive || boostActive) ? THRUST_RING_MULTIPLIER : 1;
        const ringSpeed = BASE_RING_SPEED * speedMultiplier;

        // === RING ANIMATIONS (Opposite directions) ===
        if (innerRingRef.current) {
            innerRingRef.current.rotation.y += ringSpeed * delta;
        }
        if (outerRingRef.current) {
            outerRingRef.current.rotation.y -= ringSpeed * 0.7 * delta;
        }

        // === LANDING GEAR LOGIC ===
        // Use SCALE for visibility: 0 = invisible/retracted, 1 = visible/deployed
        // This makes legs appear to deploy from inside the craft
        const targetLegScale = isGearDeployed ? 1 : 0;

        // Smooth interpolation for natural deploy/retract animation
        smoothLegAngle.current = THREE.MathUtils.lerp(
            smoothLegAngle.current,
            targetLegScale,
            4 * delta // Slightly faster for responsive feel
        );

        const currentScale = smoothLegAngle.current;

        // Apply scale to all legs (uniform XYZ scale for deploy effect)
        if (legBackRef.current) {
            legBackRef.current.scale.setScalar(currentScale);
            // Also move Y position to simulate deploying from chassis
            legBackRef.current.position.y = THREE.MathUtils.lerp(-0.3, -0.5, currentScale);
            legBackRef.current.visible = currentScale > 0.01;
        }
        if (legLeftRef.current) {
            legLeftRef.current.scale.setScalar(currentScale);
            legLeftRef.current.position.y = THREE.MathUtils.lerp(-0.3, -0.5, currentScale);
            legLeftRef.current.visible = currentScale > 0.01;
        }
        if (legRightRef.current) {
            legRightRef.current.scale.setScalar(currentScale);
            legRightRef.current.position.y = THREE.MathUtils.lerp(-0.3, -0.5, currentScale);
            legRightRef.current.visible = currentScale > 0.01;
        }

        // === ENGINE GLOW (Emissive pulse) ===
        const targetEmissive = boostActive ? 2.5 : thrustActive ? 1.5 : 0.5;
        smoothEmissive.current = THREE.MathUtils.lerp(
            smoothEmissive.current,
            targetEmissive,
            5 * delta
        );

        // Apply emissive to materials if they exist
        // Note: This depends on how the model's materials are set up
        // We'll update material emissiveIntensity if available

        // === HOVER BOB (Idle floating) ===
        if (chassisRef.current) {
            // Subtle sine wave bob
            const bobAmount = (thrustActive || boostActive) ? 0 : 0.02;
            chassisRef.current.position.y = Math.sin(time * 2) * bobAmount;

            // Bank on strafe
            const targetRoll = strafeDirection * 0.12;
            chassisRef.current.rotation.z = THREE.MathUtils.lerp(
                chassisRef.current.rotation.z,
                targetRoll,
                4 * delta
            );
        }
    });

    // Clone materials to make them independent and add emissive
    const chassisMaterial = useMemo(() => {
        if (materials?.chassis) {
            const mat = materials.chassis.clone();
            mat.emissive = new THREE.Color('#4f9eff');
            mat.emissiveIntensity = 0.1;
            return mat;
        }
        return new THREE.MeshStandardMaterial({
            color: '#1a1a2e',
            emissive: '#4f9eff',
            emissiveIntensity: 0.1,
            metalness: 0.8,
            roughness: 0.3
        });
    }, [materials]);

    const ringMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: '#ffd700',
            emissive: '#ffd700',
            emissiveIntensity: 0.8,
            metalness: 0.9,
            roughness: 0.1,
            toneMapped: false
        });
    }, []);

    const legMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: '#2a2a4a',
            emissive: '#4f9eff',
            emissiveIntensity: 0.05,
            metalness: 0.7,
            roughness: 0.4
        });
    }, []);

    // Check if nodes exist and render accordingly
    if (!nodes) {
        // Fallback if model not loaded yet
        return (
            <mesh>
                <boxGeometry args={[1, 0.5, 1.5]} />
                <meshStandardMaterial color="#4f9eff" />
            </mesh>
        );
    }

    return (
        <group ref={chassisRef} rotation-y={Math.PI / 2} scale={0.6}>
            {/* Main Chassis */}
            {nodes.chassis && (
                <primitive
                    object={nodes.chassis.clone()}
                    material={chassisMaterial}
                    castShadow
                    receiveShadow
                />
            )}

            {/* Inner Ring - Spins one direction */}
            {nodes.inner_ring && (
                <primitive
                    ref={innerRingRef}
                    object={nodes.inner_ring.clone()}
                    material={ringMaterial}
                />
            )}

            {/* Outer Ring - Spins opposite direction */}
            {nodes.outer_ring && (
                <primitive
                    ref={outerRingRef}
                    object={nodes.outer_ring.clone()}
                    material={ringMaterial}
                />
            )}

            {/* Landing Gear - Back */}
            {nodes.leg_back && (
                <primitive
                    ref={legBackRef}
                    object={nodes.leg_back.clone()}
                    material={legMaterial}
                />
            )}

            {/* Landing Gear - Left */}
            {nodes.leg_left && (
                <primitive
                    ref={legLeftRef}
                    object={nodes.leg_left.clone()}
                    material={legMaterial}
                />
            )}

            {/* Landing Gear - Right */}
            {nodes.leg_right && (
                <primitive
                    ref={legRightRef}
                    object={nodes.leg_right.clone()}
                    material={legMaterial}
                />
            )}

            {/* Engine core glow effect */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshBasicMaterial
                    color={boostActive ? '#ff8800' : '#00ffff'}
                    transparent
                    opacity={thrustActive || boostActive ? 0.9 : 0.5}
                    toneMapped={false}
                />
            </mesh>

            {/* Core point light */}
            <pointLight
                position={[0, 0, 0]}
                color={boostActive ? '#ff8800' : '#4f9eff'}
                intensity={boostActive ? 4 : thrustActive ? 2.5 : 1.5}
                distance={8}
            />
        </group>
    );
}
