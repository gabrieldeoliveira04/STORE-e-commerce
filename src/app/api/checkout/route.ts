import { NextResponse } from "next/server";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/checkout`;

async function getToken(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "");
  }
  return null;
}

export async function POST(req: Request) {
  const token = await getToken(req);

  if (!token) {
    return NextResponse.json(
      { error: "Usuário não autenticado" },
      { status: 401 },
    );
  }

  const body = await req.json();

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || "Erro ao criar preferência" },
        { status: res.status },
      );
    }

    // Retorna apenas o link de checkout
    return NextResponse.json({
      url: data.url || data.init_point || data.id,
    });
  } catch (err: any) {
    console.error("Erro no checkout API:", err);
    return NextResponse.json(
      { error: "Erro ao processar o checkout" },
      { status: 500 },
    );
  }
}
