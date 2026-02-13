import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export function getAccessToken(): string | undefined {
  return Cookies.get(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, { expires: 1, sameSite: 'lax' });
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 30, sameSite: 'lax' });
}

export function clearTokens(): void {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
