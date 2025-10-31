"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { decodeToken } from "@/lib/decodeToken";
import { getAuthToken } from "@/services/localstorage.service";

interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export default function Carrinho() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  const fetchCart = async () => {
    let token: string;
    try {
      token = getAuthToken();
    } catch {
      toast.error("Usuário não autenticado");
      return;
    }

    const decoded = decodeToken(token);
    const userId = decoded?.id as number | undefined;

    if (!userId) {
      toast.error("Token inválido");
      return;
    }

    try {
      const res = await fetch(
        `https://e-commerce-feltec.onrender.com/api/Carts/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Erro ao buscar carrinho");

      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error("Não foi possível carregar o carrinho.");
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Remove item
  const handleRemove = async (productId: number) => {
    let token: string;
    try {
      token = getAuthToken();
    } catch {
      toast.error("Usuário não autenticado");
      return;
    }

    const decoded = decodeToken(token);
    const userId = decoded?.id as number | undefined;
    if (!userId) {
      toast.error("Token inválido");
      return;
    }

    try {
      const res = await fetch(
        `https://e-commerce-feltec.onrender.com/api/Carts/${userId}/remove/${productId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );

      if (!res.ok) throw new Error("Erro ao remover produto");

      setItems((prev) => {
        const updated = prev.filter((item) => item.productId !== productId);
        setTotal(
          updated.reduce((sum, item) => sum + item.price * item.quantity, 0),
        );
        return updated;
      });

      toast.success("Produto removido do carrinho");
    } catch (err) {
      toast.error("Não foi possível remover o produto.");
    }
  };

  // Atualiza quantidade
  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) return;

    let token: string;
    try {
      token = getAuthToken();
    } catch {
      toast.error("Usuário não autenticado");
      return;
    }

    const decoded = decodeToken(token);
    const userId = decoded?.id as number | undefined;
    if (!userId) {
      toast.error("Token inválido");
      return;
    }

    try {
      const res = await fetch(
        `https://e-commerce-feltec.onrender.com/api/Carts/${userId}/update/${productId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(quantity),
        },
      );

      if (!res.ok) throw new Error("Erro ao atualizar quantidade");

      setItems((prev) => {
        const updated = prev.map((item) =>
          item.productId === productId ? { ...item, quantity } : item,
        );
        setTotal(
          updated.reduce((sum, item) => sum + item.price * item.quantity, 0),
        );
        return updated;
      });
    } catch (err) {
      toast.error("Não foi possível atualizar a quantidade.");
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Carrinho vazio");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      // 🔥 Converte o formato dos produtos para o que o backend espera
      const payload = {
        items: items.map((i) => ({
          title: i.productName,
          quantity: i.quantity,
          currency_id: "BRL",
          unit_price: i.price,
        })),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      console.log("Checkout response:", data);
      if (!res.ok) throw new Error(data.error || "Erro no checkout");

      window.location.href = data.url;
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao iniciar o pagamento");
    }
  };
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Meu Carrinho</h1>
      {items.length === 0 && <p>Carrinho vazio</p>}
      {items.map((item) => (
        <div
          key={item.productId}
          className="flex justify-between border-b py-3 items-center"
        >
          <div>
            <p>{item.productName}</p>
            <div className="flex items-center gap-2 mt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleUpdateQuantity(item.productId, item.quantity - 1)
                }
                disabled={item.quantity <= 1}
              >
                -
              </Button>
              <span className="text-lg font-semibold">{item.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleUpdateQuantity(item.productId, item.quantity + 1)
                }
              >
                +
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p>R$ {(item.price * item.quantity).toFixed(2)}</p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRemove(item.productId)}
            >
              X
            </Button>
          </div>
        </div>
      ))}
      {items.length > 0 && (
        <div className="mt-6 text-right">
          <p className="text-xl font-semibold">Total: R$ {total.toFixed(2)}</p>
          <Button className="mt-3" onClick={handleCheckout}>
            Finalizar Compra
          </Button>
        </div>
      )}
    </div>
  );
}
