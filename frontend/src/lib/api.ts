import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ROUTE_PATHS } from './constants';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface AuthTokenResponse {
  acessToken?: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL?.trim() || '/api';
let refreshInFlight: Promise<string | null> | null = null;

export async function refreshSession(): Promise<string | null> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    try {
      const response = await axios.post<AuthTokenResponse>(
        `${API_BASE_URL}/auth/refresh`,
        undefined,
        { withCredentials: true }
      );

      const refreshedAcessToken = response.data.acessToken;
      if (!refreshedAcessToken) {
        localStorage.removeItem('acessToken');
        return null;
      }

      localStorage.setItem('acessToken', refreshedAcessToken);
      return refreshedAcessToken;
    } catch {
      localStorage.removeItem('acessToken');
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('acessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const isAuthEndpoint = (url?: string) => {
  if (!url) {
    return false;
  }

  return ['/auth/login', '/auth/register', '/auth/refresh'].some((path) =>
    url.includes(path)
  );
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;

      const refreshedAcessToken = await refreshSession();
      if (!refreshedAcessToken) {
        if (window.location.pathname !== ROUTE_PATHS.login) {
          window.location.href = ROUTE_PATHS.login;
        }

        return Promise.reject(error);
      }

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${refreshedAcessToken}`;
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);
