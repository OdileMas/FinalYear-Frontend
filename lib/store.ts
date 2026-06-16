import { create } from "zustand";

interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
}

interface NotificationState {
  count: number;
  readAll: () => void;
}

interface MobileNavState {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set(() => ({ isOpen: false })),
}));

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  toggle: () => set((state) => ({ isDark: !state.isDark })),
}));

export const useNotificationStore = create<NotificationState>((set) => ({
  count: 4,
  readAll: () => set(() => ({ count: 0 })),
}));

export const useMobileNavStore = create<MobileNavState>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set(() => ({ isOpen: false })),
}));