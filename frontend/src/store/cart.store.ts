import { create } from 'zustand';
import { Cart } from '@/types';
import { cartApi } from '@/services/api';
import toast from 'react-hot-toast';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, variantId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const cart = await cartApi.get();
      set({ cart });
    } catch {
      set({ cart: null });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, variantId, quantity = 1) => {
    set({ isLoading: true });
    try {
      await cartApi.add(productId, variantId, quantity);
      await get().fetchCart();
      toast.success('Producto agregado al carrito');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al agregar al carrito');
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (itemId, quantity) => {
    set({ isLoading: true });
    try {
      await cartApi.update(itemId, quantity);
      await get().fetchCart();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar');
    } finally {
      set({ isLoading: false });
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true });
    try {
      await cartApi.remove(itemId);
      await get().fetchCart();
      toast.success('Producto eliminado del carrito');
    } catch {
      toast.error('Error al eliminar producto');
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    try {
      await cartApi.clear();
      set({ cart: null });
    } catch {
      toast.error('Error al vaciar carrito');
    }
  },
}));
