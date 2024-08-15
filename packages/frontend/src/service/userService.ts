
import api from '../lib/api';
import { User } from '../types';



export const fetchUserInfo = async (): Promise<User | null> => {
  try {
    const response = await api.get<User>('/user/me');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user info:', error);
    return null;
  }
};