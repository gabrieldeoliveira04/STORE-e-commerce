import { NextResponse } from "next/server";

const API_URL = "https://e-commerce-feltec.onrender.com/api/Carts";

// Busca o token do localStorage no cliente (via header customizado no fetch)
async function getToken(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "");
  }
  return null;
}

export async function GET(req: Request) {
  const token = await getToken(req);

  if (!token) {
    return NextResponse.json(
      { error: "Usuário não autenticado" },
      { status: 401 },
    );
  }

  const res = await fetch(`${API_URL}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Erro ao buscar carrinho" },
      { status: res.status },
    );
  }

  const data = await res.json();
  return NextResponse.json({
    items: data.items ?? [],
    total: data.total ?? 0,
  });
}

export async function POST(req: Request) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json(
      { error: "Usuário não autenticado" },
      { status: 401 },
    );
  }

  const { productId, quantity } = await req.json();

  const res = await fetch(`${API_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      productId,
      quantity,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Erro ao adicionar produto:", text);
    return NextResponse.json(
      { error: "Erro ao adicionar produto ao carrinho" },
      { status: res.status },
    );
  }

  const data = await res.json();
  return NextResponse.json({
    success: true,
    items: data.items ?? [],
    total: data.total ?? 0,
  });
}

export async function DELETE(req: Request) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json(
      { error: "Usuário não autenticado" },
      { status: 401 },
    );
  }

  const { productId } = await req.json(); // pega o ID do produto a ser removido

  if (!productId) {
    return NextResponse.json(
      { error: "productId é obrigatório" },
      { status: 400 },
    );
  }

  const res = await fetch(`${API_URL}/${productId}`, {
    // chama o endpoint do backend para remover
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Erro ao remover produto:", text);
    return NextResponse.json(
      { error: "Erro ao remover produto do carrinho" },
      { status: res.status },
    );
  }

  const data = await res.json();
  return NextResponse.json({
    success: true,
    items: data.items ?? [],
    total: data.total ?? 0,
  });
}
