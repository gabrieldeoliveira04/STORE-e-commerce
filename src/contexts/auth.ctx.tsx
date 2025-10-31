import type {
  AuthContextTypes,
  AuthProviderProps,
  AuthResponseCore,
} from "@/app/(auth)/login/types/contract";
import { localstorageService } from "@/services/localstorage.service";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext({} as AuthContextTypes);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthResponseCore | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const handleSetUser = (data: AuthResponseCore) => setUser(data);
  const handleExitUser = () => setUser(null);

  useEffect(() => {
    const storedUser = localstorageService.loadDataUserIsLogged();
    if (storedUser) setUser(storedUser);
    setIsCheckingAuth(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, handleSetUser, handleExitUser }}>
      {!isCheckingAuth && children}
    </AuthContext.Provider>
  );
}
