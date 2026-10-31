const TRUST_TOKEN_KEY = "trust_token";

export function getStoredTrustToken() {
  return localStorage.getItem(TRUST_TOKEN_KEY) || "";
}

export function storeTrustToken(token?: string) {
  if (token) localStorage.setItem(TRUST_TOKEN_KEY, token);
}

export function clearTrustToken() {
  localStorage.removeItem(TRUST_TOKEN_KEY);
}
