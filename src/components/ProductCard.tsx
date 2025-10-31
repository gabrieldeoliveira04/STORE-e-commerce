"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Product } from "@/data/products";
import { formatPrice } from "@/lib/filters";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { toast } from "react-hot-toast";
import { decodeToken } from "@/lib/decodeToken";
import { getAuthToken } from "@/services/localstorage.service";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const stock = product.stock ?? 0;
  const price = product.price ?? 0;

  const token =
    typeof window !== "undefined"
      ? (() => {
          try {
            return getAuthToken();
          } catch {
            return null;
          }
        })()
      : null;
  const decoded = token ? decodeToken(token) : null;
  const userId = decoded?.id as number | undefined;

  const handleAddToCart = async () => {
    if (!token) {
      toast.error("Você precisa estar logado para adicionar ao carrinho.");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(
        `https://e-commerce-feltec.onrender.com/api/Carts/${userId}/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product.id,
            quantity,
          }),
        },
      );

      if (!res.ok) throw new Error("Erro ao adicionar produto");

      toast.success(`${product.name} foi adicionado ao carrinho!`);
      router.push("/carrinho");
    } catch (err) {
      toast.error("Não foi possível adicionar ao carrinho.");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{
        scale: 1.03,
        y: -6,
        boxShadow: "0 15px 35px var(--color-sunset-dark)",
        transition: {
          duration: 0.25,
          type: "spring",
          stiffness: 200,
          damping: 20,
        },
      }}
      className="group relative bg-card border border-border/50 rounded-2xl overflow-hidden shadow-card transition-all duration-300"
    >
      {/* Imagem */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <motion.img
          src={product.image ?? "/placeholder.png"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300"
          whileHover={{ scale: 1.07 }}
          loading="lazy"
        />

        {/* Estoque */}
        <div className="absolute top-3 right-3">
          <Badge
            variant={stock > 0 ? "secondary" : "destructive"}
            className="text-xs"
          >
            {stock > 0 ? "Em estoque" : "Esgotado"}
          </Badge>
        </div>

        {/* Categoria */}
        {product.category && (
          <div className="absolute top-3 left-3">
            <Badge
              variant="outline"
              className="text-xs bg-background/80 backdrop-blur-sm"
            >
              {typeof product.category === "object"
                ? product.category.name
                : product.category}
            </Badge>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        <h3 className="font-semibold text-lg text-foreground mb-2 dark:group-hover:text-white transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 dark:group-hover:text-white/90 transition-colors">
          {product.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {product.tags?.length ? (
            product.tags.slice(0, 3).map((tag: any, i: number) => {
              if (typeof tag === "object" && tag?.name)
                return (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag.name}
                  </Badge>
                );
              if (typeof tag === "string")
                return (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                );
              return null;
            })
          ) : (
            <Badge variant="outline" className="hidden text-xs opacity-70">
              Sem tags
            </Badge>
          )}
        </div>

        {/* Preço */}
        <div className="text-2xl font-bold text-primary mb-4">
          {formatPrice(price)}
        </div>

        {/* Quantidade */}
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            -
          </Button>
          <span className="text-lg font-semibold">{quantity}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity((q) => q + 1)}
            disabled={quantity >= stock}
          >
            +
          </Button>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={stock <= 0}
          className="w-full mt-2"
          variant="outline"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Adicionar ao Carrinho
        </Button>
      </div>
    </motion.div>
  );
}
