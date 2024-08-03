import axios from 'axios'
import { User } from '../types'

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export const handleGoogleCallback = async (code: string): Promise<{ user: User; token: string }> => {
  const response = await api.get<{ user: User; token: string }>(`/auth/google/callback?code=${code}`);
  return response.data;
};


export const register = async (username: string, email: string, password: string) => {
  const response = await api.post('/auth/register', { username, email, password })
  return response.data
}

export const getUserVideos = async () => {
  const response = await api.get('/videos')
  return response.data
}

export default api