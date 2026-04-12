import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshResponse {
  acessToken: string;
  refreshToken?: string | null;
  newRefreshToken?: string | null;
}
  
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('acessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response, // Se a resposta for OK (200), só retorna ela
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Se o erro for 401 (Token expirado) e ainda não tentamos o refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (!storedRefreshToken) {
          return Promise.reject(error);
        }
        
        const response = await axios.post<RefreshResponse>(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken: storedRefreshToken }
        );

        const { acessToken, refreshToken, newRefreshToken } = response.data;
        const nextRefreshToken = newRefreshToken ?? refreshToken;

        // Salva os novos tokens
        localStorage.setItem('acessToken', acessToken);
        if (nextRefreshToken) localStorage.setItem('refreshToken', nextRefreshToken);


        originalRequest.headers.Authorization = `Bearer ${acessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        localStorage.removeItem('acessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
