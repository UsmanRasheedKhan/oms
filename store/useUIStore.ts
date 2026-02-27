import { create } from 'zustand';

interface UIState {
    isOffline: boolean;
    setOffline: (status: boolean) => void;
    syncInProgress: boolean;
    setSyncInProgress: (status: boolean) => void;
    currency: 'PKR' | 'USD';
    setCurrency: (c: 'PKR' | 'USD') => void;
}

export const useUIStore = create<UIState>((set) => ({
    isOffline: false,
    setOffline: (status) => set({ isOffline: status }),
    syncInProgress: false,
    setSyncInProgress: (status) => set({ syncInProgress: status }),
    currency: 'PKR',
    setCurrency: (c) => set({ currency: c })
}));
