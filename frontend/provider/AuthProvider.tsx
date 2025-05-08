// providers/AuthProvider.tsx
"use client";

import {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useContext,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, getCurrentUser, logout } from "@/lib/auth-utils";

interface AuthContextType {
  user: any | null;
  isLoggedIn: boolean;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  loading: true,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/", "/about"];

  useEffect(() => {
    const checkAuth = async () => {
      // Check for authentication token
      const isLoggedIn = isAuthenticated();

      if (isLoggedIn) {
        try {
          // Get user data from localStorage
          const userData = getCurrentUser();

          // Debug - check what's coming from localStorage
          console.log("User data from localStorage:", userData);

          if (userData) {
            setUser(userData);
          } else {
            // If we have a token but no user data, something's wrong
            console.error("Auth token exists but no user data found");
            handleLogout(); // Clear invalid auth state
          }
        } catch (error) {
          console.error("Error retrieving user data:", error);
          handleLogout();
        }
      } else {
        setUser(null);
        // Redirect to login if accessing a protected route
        if (!publicRoutes.includes(pathname) && !pathname.startsWith("/auth")) {
          router.push("/login");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = () => {
    logout();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        loading,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
