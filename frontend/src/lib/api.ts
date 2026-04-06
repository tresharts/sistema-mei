import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
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
        const refreshToken = localStorage.getItem('refreshToken');
        
        
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
          refreshToken: refreshToken
        });

        const { acessToken, newRefreshToken } = response.data;

        // Salva os novos tokens
        localStorage.setItem('acessToken', acessToken);
        if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);


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