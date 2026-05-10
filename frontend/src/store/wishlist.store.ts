import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      has: (id) => get().ids.includes(id),
      toggle: (id) => set(state => ({
        ids: state.ids.includes(id)
          ? state.ids.filter(x => x !== id)
          : [...state.ids, id],
      })),
      add: (id) => set(state =>
        state.ids.includes(id) ? state : { ids: [...state.ids, id] }
      ),
      remove: (id) => set(state => ({ ids: state.ids.filter(x => x !== id) })),
      clear: () => set({ ids: [] }),
      count: () => get().ids.length,
    }),
    { name: 'calzado-wishlist' },
  ),
);
