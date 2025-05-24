// src/contexts/AuthContext.js
import { createContext, useContext, useEffect } from "react";
import { create } from "zustand";

const AuthContext = createContext(null);

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  login: async (credentials, rememberMe = false) => {
    try {
      set({ loading: true, error: null });
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser.email === credentials.email && storedUser.password === credentials.password) {
        const user = { email: storedUser.email, name: storedUser.name };
        if (rememberMe) {
          localStorage.setItem("authToken", "mock-token");
        } else {
          sessionStorage.setItem("authToken", "mock-token");
        }
        set({ user, isAuthenticated: true, loading: false });
        return { success: true, user };
      }
      throw new Error("Invalid credentials");
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: { response: { data: { message: error.message } } } };
    }
  },

  register: async (userData) => {
    try {
      set({ loading: true, error: null });
      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (existingUser.email === userData.email) {
        throw new Error("User already exists");
      }
      const user = {
        email: userData.email,
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        password: userData.password,
      };
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("authToken", "mock-token");
      set({ user: { email: user.email, name: user.name }, isAuthenticated: true, loading: false });
      return { success: true, user };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: { response: { data: { message: error.message } } } };
    }
  },

  logout: async () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("user");
    set({ user: null, isAuthenticated: false, error: null, loading: false });
    return { success: true };
  },

  checkAuth: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (token && storedUser.email) {
        set({ user: { email: storedUser.email, name: storedUser.name }, isAuthenticated: true, loading: false });
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, loading: false, error: error.message });
    }
  },
}));

export function AuthProvider({ children }) {
  useEffect(() => {
    useAuthStore.getState().checkAuth();
  }, []);

  return <AuthContext.Provider value={useAuthStore()}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}