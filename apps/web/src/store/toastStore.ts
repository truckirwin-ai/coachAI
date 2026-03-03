import { create } from 'zustand';

interface ToastStore {
  message: string;
  visible: boolean;
  show: (msg: string) => void;
  hide: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  message: '',
  visible: false,
  show: (msg) => set({ message: msg, visible: true }),
  hide: () => set({ visible: false }),
}));
