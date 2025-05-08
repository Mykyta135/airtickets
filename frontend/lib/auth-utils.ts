// lib/auth-utils.ts
require("dotenv").config();

export function getAuthHeader(): HeadersInit {
  const headers: HeadersInit = {};

  // Add API key
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }

  // Add auth token if available (client-side only)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

export function isAuthenticated(): boolean {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token ? "exists" : "missing");
    return !!token;
  }
  return false;
}

export function getCurrentUser(): any | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    console.log("User string from localStorage:", userStr || "missing");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.log("Error parsing user data:", e);
        return null;
      }
    }
  }
  return null;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to login page or refresh the current page
    window.location.href = "/login";
  }
}
