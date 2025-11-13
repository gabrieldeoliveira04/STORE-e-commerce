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

interface Endereco {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
}

export default function Carrinho() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState<Endereco | null>(null);
  const [freteValor, setFreteValor] = useState<number | null>(null);
  const [carregandoFrete, setCarregandoFrete] = useState(false);

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
    } catch {
      toast.error("Não foi possível carregar o carrinho.");
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 🔹 Buscar endereço pelo CEP (BrasilAPI)
  const handleBuscarEndereco = async () => {
    if (cep.length < 8) {
      toast.error("CEP inválido");
      return;
    }
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
      if (!res.ok) throw new Error("Erro ao buscar endereço");
      const data = await res.json();
      setEndereco(data);
      toast.success("Endereço encontrado!");
    } catch {
      toast.error("Não foi possível localizar o CEP");
      setEndereco(null);
    }
  };

  // 🔹 Calcular frete (usando endpoint da sua API com Mercado Envios)
  // 🔹 Calcular frete corretamente (POST com corpo JSON)
  const handleCalcularFrete = async () => {
    if (!cep) {
      toast.error("Informe o CEP para calcular o frete");
      return;
    }

    setCarregandoFrete(true);
    try {
      const res = await fetch(
        "https://e-commerce-feltec.onrender.com/api/Shipping/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from: { postal_code: "09010120" }, // CEP de origem fixo da loja
            to: { postal_code: cep },
            package: { height: 10, width: 15, length: 20, weight: 1 },
            options: { receipt: false, own_hand: false },
          }),
        },
      );

      if (!res.ok) throw new Error("Erro ao calcular frete");

      const data = await res.json();
      // Filtra apenas opções válidas
      const validas = data.filter((d: any) => !d.error);

      if (validas.length === 0) {
        toast.error("Nenhuma transportadora disponível para este CEP");
        setFreteValor(null);
        return;
      }

      // Seleciona o frete mais barato
      const maisBarato = validas.reduce((prev: any, curr: any) =>
        parseFloat(curr.custom_price) < parseFloat(prev.custom_price)
          ? curr
          : prev,
      );

      setFreteValor(parseFloat(maisBarato.custom_price));
      toast.success(
        `Frete (${maisBarato.company.name} - ${maisBarato.name}): R$ ${maisBarato.custom_price}`,
      );
    } catch (err) {
      console.error(err);
      toast.error("Erro ao calcular o frete");
    } finally {
      setCarregandoFrete(false);
    }
  };

  // 🔹 Remover produto
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
    } catch {
      toast.error("Não foi possível remover o produto.");
    }
  };

  // 🔹 Atualizar quantidade
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
    } catch {
      toast.error("Não foi possível atualizar a quantidade.");
    }
  };

  // 🔹 Checkout com frete incluso
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
      const payload = {
        items: items.map((i) => ({
          title: i.productName,
          quantity: i.quantity,
          currency_id: "BRL",
          unit_price: i.price,
        })),
        frete: freteValor || 0,
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
      if (!res.ok) throw new Error(data.error || "Erro no checkout");

      window.location.href = data.url;
    } catch {
      toast.error("Erro ao iniciar o pagamento");
    }
  };

  const totalComFrete = total + (freteValor || 0);

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

      <div className="mt-6">
        <h2 className="font-semibold mb-2">Calcular Frete</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Digite o CEP"
            value={cep}
            onChange={(e) => setCep(e.target.value.replace(/\D/g, ""))}
            className="border px-3 py-1 rounded w-40"
          />
          <Button onClick={handleBuscarEndereco} variant="outline">
            Buscar Endereço
          </Button>
          <Button onClick={handleCalcularFrete} disabled={carregandoFrete}>
            {carregandoFrete ? "Calculando..." : "Calcular Frete"}
          </Button>
        </div>

        {endereco && (
          <div className="mt-3 text-sm text-gray-700">
            <p>
              <strong>Endereço:</strong> {endereco.street},{" "}
              {endereco.neighborhood} — {endereco.city}/{endereco.state}
            </p>
          </div>
        )}

        {freteValor !== null && (
          <p className="mt-3 text-green-600 font-semibold">
            Frete: R$ {freteValor.toFixed(2)}
          </p>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-6 text-right">
          <p className="text-xl font-semibold">
            Total: R$ {totalComFrete.toFixed(2)}
          </p>
          <Button className="mt-3" onClick={handleCheckout}>
            Finalizar Compra
          </Button>
        </div>
      )}
    </div>
  );
}
