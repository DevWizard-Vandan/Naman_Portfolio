'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CuboidCollider, useRapier } from '@react-three/rapier';
import { Trail, Sparkles, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useControls } from '@/hooks/useControls';
import { useFlightStore } from '@/store/store';
import { VimanaModel } from './VimanaModel';

// Force constants - increased for responsive flight
// Force constants - significantly increased
// Physics constants
const MAX_SPEED = 20;
const ACCELERATION = 2; // Lerp factor
const LIFT_SPEED = 8;
const GRAVITY_COMPENSATION = 0.98; // Help it float
const TURN_SPEED = 3;
const LINEAR_DAMPING = 2.0; // Higher damping for velocity control stability
const ANGULAR_DAMPING = 4.0;

// Camera settings - adjusted for the model scale
const CAMERA_OFFSET = new THREE.Vector3(0, 2.5, 6);
const CAMERA_LERP_SPEED = 4;

// Visual tilt
const MAX_PITCH_TILT = -0.22;
const TILT_SPEED = 5;

export function Vimana() {
    const rigidRef = useRef<RapierRigidBody>(null);
    const meshGroupRef = useRef<THREE.Group>(null);

    // Trail anchor refs (wingtip positions relative to model)
    const trailLeftRef = useRef<THREE.Object3D>(null!);
    const trailRightRef = useRef<THREE.Object3D>(null!);
    const trailRearRef = useRef<THREE.Object3D>(null!);

    const controls = useControls();
    const { setFlightData, setBoostActive, isGameStarted, isGearDeployed, toggleGear } = useFlightStore();
    const { world, rapier } = useRapier();

    // Debounce for gear toggle
    const prevToggleRef = useRef(false);

    // State for visual model
    const [thrustActive, setThrustActive] = useState(false);
    const [isBoostingLocal, setIsBoostingLocal] = useState(false);
    const [strafeDirection, setStrafeDirection] = useState(0);
    const [currentAltitude, setCurrentAltitude] = useState(0);
    const [distToGround, setDistToGround] = useState(10); // Default high

    // Persistent vectors
    const cameraTargetPos = useMemo(() => new THREE.Vector3(), []);
    const cameraLookAt = useMemo(() => new THREE.Vector3(), []);
    const impulseVec = useMemo(() => new THREE.Vector3(), []);
    const torqueVec = useMemo(() => new THREE.Vector3(), []);
    const localForward = useMemo(() => new THREE.Vector3(), []);
    const localRight = useMemo(() => new THREE.Vector3(), []);

    const targetPitch = useRef(0);

    useFrame((state, delta) => {
        if (!rigidRef.current) return;

        const body = rigidRef.current;
        const position = body.translation();
        const rotation = body.rotation();
        const velocity = body.linvel();

        // Telemetry
        const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
        const altitude = Math.max(0, position.y - 0.5);
        setFlightData(altitude, speed);
        setCurrentAltitude(altitude);

        // Raycast for landing gear (downward)
        const atomicPos = body.translation();
        const rayOrigin = { x: atomicPos.x, y: atomicPos.y - 0.2, z: atomicPos.z }; // Start slightly below center
        const rayDir = { x: 0, y: -1, z: 0 };
        const ray = new rapier.Ray(rayOrigin, rayDir);
        const hit = world.castRay(ray, 10, true); // Max distance 10m

        if (hit) {
            setDistToGround(hit.timeOfImpact);
        } else {
            setDistToGround(10);
        }

        // Local axes from quaternion
        const quat = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
        localForward.set(0, 0, -1).applyQuaternion(quat);
        localRight.set(1, 0, 0).applyQuaternion(quat);

        // Reset forces
        impulseVec.set(0, 0, 0);
        torqueVec.set(0, 0, 0);
        targetPitch.current = 0;

        // Track input states
        let thrusting = false;
        let boosting = false;
        let strafe = 0;

        // Forward/Back (W/S)
        // === VELOCITY BASED MOVEMENT ===
        const currentVel = body.linvel();

        // Target velocity vector (horizontal)
        const targetVel = new THREE.Vector3(0, 0, 0);

        // Only allow control if game started
        if (isGameStarted) {
            if (controls.forward) {
                targetVel.add(localForward.clone().multiplyScalar(MAX_SPEED));
                targetPitch.current = MAX_PITCH_TILT;
                thrusting = true;
            }
            if (controls.backward) {
                targetVel.add(localForward.clone().multiplyScalar(-MAX_SPEED * 0.5));
                targetPitch.current = -MAX_PITCH_TILT * 0.5;
                thrusting = true;
            }
            if (controls.strafeLeft) {
                targetVel.add(localRight.clone().multiplyScalar(-MAX_SPEED * 0.8));
                strafe = -1;
                thrusting = true;
            }
            if (controls.strafeRight) {
                targetVel.add(localRight.clone().multiplyScalar(MAX_SPEED * 0.8));
                strafe = 1;
                thrusting = true;
            }
            if (controls.strafeRight) {
                targetVel.add(localRight.clone().multiplyScalar(MAX_SPEED * 0.8));
                strafe = 1;
                thrusting = true;
            }

            // Gear Toggle (G)
            if (controls.toggleGear && !prevToggleRef.current) {
                toggleGear();
            }
            prevToggleRef.current = controls.toggleGear;
        }

        // Apply smooth acceleration to horizontal velocity
        const newVelX = THREE.MathUtils.lerp(currentVel.x, targetVel.x, ACCELERATION * delta);
        const newVelZ = THREE.MathUtils.lerp(currentVel.z, targetVel.z, ACCELERATION * delta);

        // Vertical movement (independent)
        let newVelY = currentVel.y;

        if (controls.up) {
            newVelY = THREE.MathUtils.lerp(currentVel.y, LIFT_SPEED, ACCELERATION * delta);
            boosting = true;
            setBoostActive(true);
        } else if (controls.down) {
            newVelY = THREE.MathUtils.lerp(currentVel.y, -LIFT_SPEED, ACCELERATION * delta);
            thrusting = true;
            setBoostActive(false);
        } else {
            setBoostActive(false);
            // Counteract gravity for "floaty" feel
            // If gear is retracted, we want it to be more buoyant
            const hoverTarget = isGearDeployed ? -1 : 0; // Sink slightly if gear is down
            newVelY = THREE.MathUtils.lerp(currentVel.y, hoverTarget, delta * 1.5);
        }

        // Apply final velocity
        body.setLinvel({ x: newVelX, y: newVelY, z: newVelZ }, true);

        // Rotational movement (Torque is still fine, or we can use setAngvel)
        // Let's stick to simple angular velocity for crisp turning
        if (controls.left) {
            body.setAngvel({ x: 0, y: TURN_SPEED, z: 0 }, true);
        } else if (controls.right) {
            body.setAngvel({ x: 0, y: -TURN_SPEED, z: 0 }, true);
        } else {
            // Stop turning when keys released
            const currentAng = body.angvel();
            body.setAngvel({ x: 0, y: currentAng.y * 0.9, z: 0 }, true);
        }

        // Mesh visual tilt (pitch on thrust)
        if (meshGroupRef.current) {
            meshGroupRef.current.rotation.x = THREE.MathUtils.lerp(
                meshGroupRef.current.rotation.x,
                targetPitch.current,
                TILT_SPEED * delta
            );
        }

        // Chase camera - smooth follow behind
        const camOffset = CAMERA_OFFSET.clone().applyQuaternion(quat);
        cameraTargetPos.set(
            position.x + camOffset.x,
            position.y + camOffset.y,
            position.z + camOffset.z
        );
        state.camera.position.lerp(cameraTargetPos, CAMERA_LERP_SPEED * delta);

        // Intro Camera Mode
        if (!isGameStarted) {
            // Cinematic frontal view
            const time = state.clock.elapsedTime;
            // Orbit slowly around front
            const introX = Math.sin(time * 0.2) * 4;
            const introZ = -8 + Math.cos(time * 0.2) * 2;
            cameraTargetPos.set(
                position.x + introX,
                position.y + 1.5,
                position.z + introZ
            );
            // Look at ship
            cameraLookAt.set(position.x, position.y, position.z);
        } else {
            // Game Camera Mode (Chase)
            // ... existing chase logic already set cameraTargetPos above ...
        }

        // Look slightly ahead of the craft (or at craft for intro)
        state.camera.lookAt(cameraLookAt);

        // Look slightly ahead of the craft
        cameraLookAt.set(
            position.x + localForward.x * 2,
            position.y + 0.5,
            position.z + localForward.z * 2
        );
        state.camera.lookAt(cameraLookAt);
    });

    return (
        <RigidBody
            ref={rigidRef}
            type="dynamic"
            position={[0, 2, 0]}
            linearDamping={LINEAR_DAMPING}
            angularDamping={ANGULAR_DAMPING}
            mass={1}
            restitution={0.1}
            friction={isGearDeployed ? 1.0 : 0.0}
            enabledRotations={[false, true, false]}
            canSleep={false}
            colliders={false}
        >
            {/* Dynamic Collider: Becomes deeper when gear is deployed to prevent clipping and land on legs */}
            <CuboidCollider
                args={isGearDeployed ? [0.55, 0.6, 0.7] : [0.45, 0.25, 0.55]}
                position={isGearDeployed ? [0, -0.45, 0] : [0, -0.15, 0]}
            />

            <group ref={meshGroupRef}>
                {/* The GLTF Vimana Model */}
                <VimanaModel
                    thrustActive={thrustActive}
                    boostActive={isBoostingLocal}
                    altitude={currentAltitude}
                    distanceToGround={distToGround}
                    strafeDirection={strafeDirection}
                    isGearDeployed={isGearDeployed} // Manual override
                />

                {/* Trail anchor points - positioned at wingtips */}
                <object3D ref={trailLeftRef} position={[-0.8, 0, 0.3]} />
                <object3D ref={trailRightRef} position={[0.8, 0, 0.3]} />
                <object3D ref={trailRearRef} position={[0, 0, 0.9]} />

                {/* Engine trails - Tron light ribbons */}
                {trailLeftRef.current && (
                    <Trail
                        target={trailLeftRef}
                        width={0.25}
                        length={10}
                        color={isBoostingLocal ? '#ff8800' : '#4f9eff'}
                        attenuation={(t) => t * t}
                    />
                )}
                {trailRightRef.current && (
                    <Trail
                        target={trailRightRef}
                        width={0.25}
                        length={10}
                        color={isBoostingLocal ? '#ff8800' : '#4f9eff'}
                        attenuation={(t) => t * t}
                    />
                )}
                {trailRearRef.current && (
                    <Trail
                        target={trailRearRef}
                        width={0.4}
                        length={14}
                        color={isBoostingLocal ? '#ffd700' : '#00ffff'}
                        attenuation={(t) => t * t}
                    />
                )}

                <Sparkles
                    position={[0, -0.2, 0.6]}
                    count={thrustActive || isBoostingLocal ? 25 : 8}
                    scale={0.6}
                    size={isBoostingLocal ? 2.5 : thrustActive ? 1.8 : 1}
                    speed={0.5}
                    color={isBoostingLocal ? '#ff6600' : '#4f9eff'}
                    opacity={thrustActive || isBoostingLocal ? 1 : 0.4}
                />

                {/* Extra boost particles */}
                {isBoostingLocal && (
                    <Sparkles
                        position={[0, 0, 0]}
                        count={40}
                        scale={1.2}
                        size={3}
                        speed={0.8}
                        color="#ffd700"
                    />
                )}

                <pointLight
                    position={[0, -1, 0]}
                    color="#00ffff"
                    intensity={isBoostingLocal ? 5 : thrustActive ? 3 : 2}
                    distance={15}
                    castShadow
                />

                <spotLight
                    position={[0, -0.5, 0]}
                    target-position={[0, -20, 0]}
                    color="#4f9eff"
                    intensity={isBoostingLocal ? 6 : thrustActive ? 4 : 2}
                    angle={0.5}
                    penumbra={0.6}
                    distance={30}
                    castShadow
                    shadow-mapSize={[512, 512]}
                />
            </group>
        </RigidBody>
    );
}
