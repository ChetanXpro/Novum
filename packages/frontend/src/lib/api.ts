import axios from 'axios';
import { User } from '../types';

import { getDefaultStore } from 'jotai';
import { getToken } from './auth';

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const handleGoogleAuth = async (token: string): Promise<{ user: User; token: string }> => {
  const response = await api.post<{ user: User; token: string }>('/auth/google', { token });
  return response.data;
};

export const fetchUserInfo = async (): Promise<User> => {
  const response = await api.get<User>('/users/me');
  return response.data;
};

export const getUserVideos = async () => {
  const response = await api.get('/videos');
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (username: string, email: string, password: string) => {
  const response = await api.post('/auth/register', { username, email, password });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};



export const initiateUpload = async (title: string, userId: string, fileType: string) => {
  const response = await api.post('/videos/initiate-upload', { title, userId, fileType });
  return response.data;
}

export const completeUpload = async (videoId: string) => {
  await api.post(`/videos/${videoId}/complete-upload`);
}

export default api;