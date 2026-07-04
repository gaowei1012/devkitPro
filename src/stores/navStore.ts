import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NavState {
  collapsed: boolean;
  favorites: string[];
  expandedGroups: string[];
  hasUserSetGroups: boolean;
  _hasHydrated: boolean;
  toggleCollapsed: () => void;
  toggleFavorite: (path: string) => void;
  toggleGroup: (groupId: string) => void;
  setExpandedGroups: (groups: string[]) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useNavStore = create<NavState>()(
  persist(
    (set) => ({
      collapsed: false,
      favorites: [],
      expandedGroups: [],
      hasUserSetGroups: false,
      _hasHydrated: false,

      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),

      toggleFavorite: (path) =>
        set((s) => ({
          favorites: s.favorites.includes(path)
            ? s.favorites.filter((p) => p !== path)
            : [...s.favorites, path],
        })),

      toggleGroup: (groupId) =>
        set((s) => ({
          hasUserSetGroups: true,
          expandedGroups: s.expandedGroups.includes(groupId)
            ? s.expandedGroups.filter((g) => g !== groupId)
            : [...s.expandedGroups, groupId],
        })),

      setExpandedGroups: (groups) => set({ expandedGroups: groups }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: 'devkit-nav',
      partialize: (state) => ({
        collapsed: state.collapsed,
        favorites: state.favorites,
        expandedGroups: state.expandedGroups,
        hasUserSetGroups: state.hasUserSetGroups,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
