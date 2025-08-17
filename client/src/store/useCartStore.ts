import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { CartState } from "@/types/cartType";
import { MenuItem } from "@/types/restaurantType";

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      // This function now accepts the restaurantId as a parameter.
      addToCart: (item: MenuItem, restaurantId: string) => {
        set((state) => {
          // Check if the cart already has items from a different restaurant
          if (state.cart.length > 0 && state.cart[0].restaurantId !== restaurantId) {
            toast.error("You can only order from one restaurant at a time. Please clear your cart first.");
            return state;
          }

          const existingCartItem = state.cart.find(
            (cartItem) => cartItem._id === item._id
          );

          if (existingCartItem) {
            // Item exists, increase quantity
            return {
              cart: state.cart.map((cartItem) =>
                cartItem._id === item._id
                  ? { ...cartItem, quantity: cartItem.quantity + 1 }
                  : cartItem
              )
            };
          } else {
            // Item does not exist, add it to the cart along with the restaurantId
            return {
              cart: [
                ...state.cart,
                { ...item, quantity: 1, restaurantId }, // <--- CORRECTED: The restaurantId is now saved here
              ]
            };
          }
        });
      },
      clearCart: () => {
        set({ cart: [] });
      },
      removeFromTheCart: (id: string) => {
        set((state) => ({
          cart: state.cart.filter((item) => item._id !== id)
        }))
      },
      incrementQuantity: (id: string) => {
        set((state) => ({
          cart: state.cart.map((item) => item._id === id ? { ...item, quantity: item.quantity + 1 } : item)
        }))
      },
      decrementQuantity: (id: string) => {
        set((state) => ({
          cart: state.cart.map((item) => item._id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item)
        }))
      }
    }), {
      name: 'cart-name',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
