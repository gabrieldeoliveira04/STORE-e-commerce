export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://e-commerce-feltec.onrender.com/api";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const userData = localStorage.getItem("@NPG-auth-user-data");
  const token = userData ? JSON.parse(userData).token : null;

  const res = await fetch(`${API_URL}/${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let data: any;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      data?.message || data?.title || `Erro ${res.status}: ${res.statusText}`;
    throw new Error(message);
  }

  return data as T;
}
