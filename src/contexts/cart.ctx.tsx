"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AuthContext } from "./auth.ctx";

interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalQuantity: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  items: [],
  totalQuantity: 0,
  refreshCart: async () => {},
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState<CartItem[]>([]);

  const refreshCart = async () => {
    if (!user?.token) {
      setItems([]);
      return;
    }

    try {
      const res = await fetch("/api/cart", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Erro ao carregar o carrinho:", error);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  return (
    <CartContext.Provider
      value={{
        items,
        totalQuantity: items.reduce((acc, i) => acc + i.quantity, 0),
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
