const LEGACY_ACCESS_TOKEN_KEY = "acessToken";
const LEGACY_REFRESH_TOKEN_KEY = "refreshToken";

let accessToken: string | null = null;

function clearLegacyStoredTokens() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
}

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null | undefined) {
  accessToken = token && token !== "undefined" && token !== "null" ? token : null;
  clearLegacyStoredTokens();
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
  clearLegacyStoredTokens();
}
