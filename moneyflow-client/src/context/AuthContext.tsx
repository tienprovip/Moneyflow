import axiosInstance from "@/api/axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/utils/token";
import React, { createContext, useContext } from "react";

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<any>(null);

  const login = async (email: string, password: string) => {
    const res = await axiosInstance.post("auth/login", { email, password });
    const { accessToken, refreshToken, user } = res.data;
    setTokens(accessToken, refreshToken);
    setUser(user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await axiosInstance.post("auth/register", {
      name,
      email,
      password,
    });
    const { accessToken, refreshToken, user } = res.data;
    setTokens(accessToken, refreshToken);
    setUser(user);
  };

  const logout = async () => {
    try {
      await axiosInstance.post("auth/logout", {
        refreshToken: getRefreshToken(),
      });
    } catch (e) {}
    clearTokens();
    setUser(null);
    window.location.href = "/auth";
  };

  React.useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
