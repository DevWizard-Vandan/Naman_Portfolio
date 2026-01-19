import { useEffect, useRef } from 'react';

export interface Controls {
    // Movement
    forward: boolean;   // W
    backward: boolean;  // S
    left: boolean;      // A (turn)
    right: boolean;     // D (turn)
    strafeLeft: boolean;  // Q
    strafeRight: boolean; // E
    // Altitude
    up: boolean;        // Space
    down: boolean;      // Shift
    // Actions
    toggleGear: boolean; // G
}

export function useControls(): Controls {
    const controls = useRef<Controls>({
        forward: false,
        backward: false,
        left: false,
        right: false,
        strafeLeft: false,
        strafeRight: false,
        up: false,
        down: false,
        toggleGear: false,
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent default for game keys
            if (['Space', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyQ', 'KeyE', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
                e.preventDefault();
            }

            switch (e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    controls.current.forward = true;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    controls.current.backward = true;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    controls.current.left = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    controls.current.right = true;
                    break;
                case 'KeyQ':
                    controls.current.strafeLeft = true;
                    break;
                case 'KeyE':
                    controls.current.strafeRight = true;
                    break;
                case 'Space':
                    controls.current.up = true;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    controls.current.down = true;
                    break;
                case 'KeyG':
                    controls.current.toggleGear = true;
                    break;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    controls.current.forward = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    controls.current.backward = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    controls.current.left = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    controls.current.right = false;
                    break;
                case 'KeyQ':
                    controls.current.strafeLeft = false;
                    break;
                case 'KeyE':
                    controls.current.strafeRight = false;
                    break;
                case 'Space':
                    controls.current.up = false;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    controls.current.down = false;
                    break;
                case 'KeyG':
                    controls.current.toggleGear = false;
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return controls.current;
}
