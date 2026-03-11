import { create } from 'zustand';

interface IntelState {
  stability: number; // 0 to 100
  explosionFactor: number; // 0 to max
  setStability: (val: number) => void;
  setExplosionFactor: (val: number) => void;
}

export const useIntelStore = create<IntelState>((set) => ({
  stability: 100,
  explosionFactor: 0,
  setStability: (val) => set({ stability: val }),
  setExplosionFactor: (val) => set({ explosionFactor: val }),
}));
