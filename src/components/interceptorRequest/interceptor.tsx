"use client";

import { useEffect } from "react";
import { localstorageService } from "@/services/localstorage.service";
import { showToast } from "../toast/showToast";

export function ClientInterceptor() {
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        const response = await originalFetch(input, init);
        const url = typeof input === "string" ? input : input.toString();

        // Ignora o login para evitar interferência
        if (url.includes("/Users/login")) {
          return response;
        }

        // Se o token for inválido ou expirado
        if (response.status === 401) {
          // Evita loop se já estiver na página de login
          if (!window.location.pathname.includes("/login")) {
            localstorageService.removeDataUserIsLogged();

            showToast({
              type: "error",
              title: "Sessão expirada",
              description: "Faça login novamente para continuar.",
            });

            setTimeout(() => {
              window.location.href = "/login";
            }, 1000);
          }
        }

        return response;
      } catch (error) {
        console.error("Erro no interceptor:", error);
        throw error;
      }
    };

    // Cleanup: restaura o fetch original se o componente desmontar
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
