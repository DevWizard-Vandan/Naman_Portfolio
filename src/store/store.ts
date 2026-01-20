import { create } from 'zustand';

// ============================================================
// PERFORMANCE MODES
// ============================================================
export type PerformanceMode = 'high' | 'medium' | 'low';
export type GamePhase = 'hangar' | 'transitioning' | 'playing';

// ============================================================
// FLIGHT STATE INTERFACE
// ============================================================
interface FlightState {
    // Flight telemetry
    altitude: number;
    speed: number;
    isBoostActive: boolean;
    setFlightData: (altitude: number, speed: number) => void;
    setBoostActive: (active: boolean) => void;

    // Game Phase
    gamePhase: GamePhase;
    setGamePhase: (phase: GamePhase) => void;

    // Landing Gear
    isGearDeployed: boolean;
    toggleGear: () => void;

    // Project Interaction
    currentProjectId: string | null;
    unlockedProjects: string[];
    setCurrentProject: (id: string | null) => void;
    unlockProject: (id: string) => void;

    // Performance Optimization
    performanceMode: PerformanceMode;
    isOptimizing: boolean;
    bloomEnabled: boolean;
    dpr: number;
    setPerformanceMode: (mode: PerformanceMode) => void;
    setOptimizing: (optimizing: boolean) => void;

    // Skill Collection
    collectedSkills: string[];
    collectSkill: (skillId: string) => void;
    lastCollectedSkill: string | null;
    clearLastCollectedSkill: () => void;

    // Info Sections
    activeSection: 'about' | 'skills' | 'contact' | null;
    setActiveSection: (section: 'about' | 'skills' | 'contact' | null) => void;
}

// ============================================================
// STORE IMPLEMENTATION
// ============================================================
export const useFlightStore = create<FlightState>((set) => ({
    // Flight telemetry defaults
    altitude: 0,
    speed: 0,
    isBoostActive: false,
    setFlightData: (altitude, speed) => set({ altitude, speed }),
    setBoostActive: (active) => set({ isBoostActive: active }),

    // Game phase - start in hangar
    gamePhase: 'hangar',
    setGamePhase: (phase) => set({ gamePhase: phase }),

    // Landing gear - starts deployed
    isGearDeployed: true,
    toggleGear: () => set((state) => ({ isGearDeployed: !state.isGearDeployed })),

    // Project Interaction
    currentProjectId: null,
    unlockedProjects: [],
    setCurrentProject: (id) => set({ currentProjectId: id }),
    unlockProject: (id) => set((state) => ({
        unlockedProjects: state.unlockedProjects.includes(id)
            ? state.unlockedProjects
            : [...state.unlockedProjects, id]
    })),

    // Performance - default to high
    performanceMode: 'high',
    isOptimizing: false,
    bloomEnabled: true,
    dpr: 1,
    setPerformanceMode: (mode) => {
        const settings = {
            high: { dpr: 2, bloomEnabled: true },
            medium: { dpr: 1, bloomEnabled: true },
            low: { dpr: 0.5, bloomEnabled: false }
        };
        set({
            performanceMode: mode,
            ...settings[mode]
        });
    },
    setOptimizing: (optimizing) => set({ isOptimizing: optimizing }),

    // Skill Collection
    collectedSkills: [],
    lastCollectedSkill: null,
    collectSkill: (skillId) => set((state) => {
        if (state.collectedSkills.includes(skillId)) {
            return state;
        }
        return {
            collectedSkills: [...state.collectedSkills, skillId],
            lastCollectedSkill: skillId
        };
    }),
    clearLastCollectedSkill: () => set({ lastCollectedSkill: null }),

    // Info Sections
    activeSection: null,
    setActiveSection: (section) => set({ activeSection: section })
}));
