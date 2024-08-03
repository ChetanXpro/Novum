import axios from 'axios';
import { User, Video } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await api.post<{ user: User; token: string }>('/auth/login', { email, password });
  return response.data;
};

export const register = async (username: string, email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await api.post<{ user: User; token: string }>('/auth/register', { username, email, password });
  return response.data;
};

export const getUserVideos = async (): Promise<Video[]> => {
  const response = await api.get<Video[]>('/videos');
  return response.data;
};