import { atom } from 'jotai';
import { fetchUserInfo } from '../lib/api';
import { User } from '../types';


export const userAtom = atom<User | null>(null);
export const isAuthenticatedAtom = atom((get) => !!get(userAtom));


export const initializeUserAtom = atom(
  null,
  async (get, set) => {
    try {
      const user = await fetchUserInfo();
      set(userAtom, user);
    } catch (error) {
      console.error('Failed to initialize user:', error);
      set(userAtom, null);
    }
  }
);