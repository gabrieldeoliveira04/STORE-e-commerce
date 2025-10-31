// interface LoginPayload {
//   email: string;
//   password: string;
// }

// interface LoginResponse {
//   userId: number;
//   name: string;
//   email: string;
//   token: string;
//   refreshToken?: string;
// }

// Função que consome o endpoint /api/login
export async function postLogin(data: { email: string; password: string }) {
  const res = await fetch(
    "https://e-commerce-feltec.onrender.com/api/Users/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) {
    throw new Error("Credenciais inválidas");
  }

  const json = await res.json();

  return {
    userId: json.user.id,
    name: json.user.name,
    email: json.user.email,
    token: json.token,
    // refreshToken: json.refreshToken,
  };
}
