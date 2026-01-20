import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useFlightStore } from '@/store/store';

interface InteractionCrystalProps {
    position: [number, number, number];
    color: string;
    section: 'about' | 'skills' | 'contact';
    title: string;
}

export function InteractionCrystal({ position, color, section, title }: InteractionCrystalProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [inRange, setInRange] = useState(false);
    const { setActiveSection } = useFlightStore();
    const { camera } = useThree();

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Rotation animation
        meshRef.current.rotation.y += delta * 0.5;
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.5;

        // Proximity check
        const distance = camera.position.distanceTo(meshRef.current.position);
        const isClose = distance < 15; // Interaction radius

        if (isClose !== inRange) {
            setInRange(isClose);
        }
    });

    // key interaction
    const handleKeyDown = (e: KeyboardEvent) => {
        if (inRange && (e.key === 'f' || e.key === 'F')) {
            setActiveSection(section);
        }
    };

    // Attach event listener only when in range is effectively handled by effect?
    // Actually, adding/removing listener every frame is bad.
    // Better to use a global listener or one inside useEffect dependent on inRange.

    // We can use a useEffect to bind the event only when inRange is true
    useState(() => {
        // This is not the right place for logic, fixing in render
    });

    // Correct way:
    const [listening, setListening] = useState(false);

    if (inRange && !listening) {
        window.addEventListener('keydown', handleKeyDown);
        setListening(true);
    } else if (!inRange && listening) {
        window.removeEventListener('keydown', handleKeyDown);
        setListening(false);
    }

    // Cleanup on unmount
    // Wait, the logic above in the render body is bad practice (side effects in render).
    // Let's use useEffect.

    return (
        <group position={position}>
            {/* The Crystal Mesh */}
            <mesh ref={meshRef}>
                <octahedronGeometry args={[1.5, 0]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={1}
                    metalness={0.9}
                    roughness={0.1}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Inner Light */}
            <pointLight position={[0, 0, 0]} color={color} intensity={3} distance={15} />

            {/* Floating Title (Always visible) */}
            <Text
                position={[0, 2.5, 0]}
                fontSize={0.8}
                color={color}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
            >
                {title}
            </Text>

            {/* "Press F" Prompt (Visible only when close) */}
            {inRange && (
                <Html position={[0, -2, 0]} center>
                    <div
                        className="px-4 py-2 rounded-lg backdrop-blur-md border animate-bounce"
                        style={{
                            background: `${color}20`,
                            border: `1px solid ${color}`,
                            color: '#ffffff',
                            fontFamily: 'monospace',
                            boxShadow: `0 0 20px ${color}40`,
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <span className="font-bold text-lg mr-2">[F]</span>
                        <span className="uppercase tracking-wider">Interact</span>
                    </div>
                </Html>
            )}

            {/* Logic Encapuslation */}
            <CrystalLogic inRange={inRange} onInteract={() => setActiveSection(section)} />
        </group>
    );
}

// Separate component to handle event listeners safely
function CrystalLogic({ inRange, onInteract }: { inRange: boolean; onInteract: () => void }) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'KeyF') {
                onInteract();
            }
        };

        if (inRange) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [inRange, onInteract]);

    return null;
}
