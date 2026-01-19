import { create } from 'zustand';

interface FlightState {
    altitude: number;
    speed: number;
    isBoostActive: boolean;
    setFlightData: (altitude: number, speed: number) => void;
    setBoostActive: (active: boolean) => void;

    // Game State
    isGameStarted: boolean;
    startGame: () => void;

    // Landing Gear
    isGearDeployed: boolean;
    toggleGear: () => void;
}

export const useFlightStore = create<FlightState>((set) => ({
    altitude: 0,
    speed: 0,
    isBoostActive: false,
    setFlightData: (altitude, speed) => set({ altitude, speed }),
    setBoostActive: (active) => set({ isBoostActive: active }),

    isGameStarted: false,
    startGame: () => set({ isGameStarted: true }),

    isGearDeployed: true, // Default deployed on start
    toggleGear: () => set((state) => ({ isGearDeployed: !state.isGearDeployed })),
}));
