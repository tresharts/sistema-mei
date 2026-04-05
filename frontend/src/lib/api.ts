// src/lib/axios.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // URL do seu Spring Boot   
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('acessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});