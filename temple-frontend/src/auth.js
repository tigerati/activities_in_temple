import { jwtDecode } from "jwt-decode";

export const TOKEN_KEY = "token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export function millisUntilExpiry(token = getToken()) {
  if (!token) return 0;
  try {
    const { exp } = jwtDecode(token); // seconds since epoch
    // add a small skew buffer (5s)
    return Math.max(0, exp * 1000 - Date.now() - 5000);
  } catch {
    return 0;
  }
}

export function isExpired(token = getToken()) {
  return millisUntilExpiry(token) <= 0;
}
