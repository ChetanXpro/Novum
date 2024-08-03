import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import * as api from '../lib/api';
import { User } from '@/types';

export const userAtom = atomWithStorage<User | null>('user', null);
export const tokenAtom = atom<string | null>(null);




export const loginAtom = atom(
  null,
  async (get, set, { email, password }: { email: string; password: string }) => {
    const { user, token } = await api.login(email, password);
    set(userAtom, user);
    set(tokenAtom, token);
  }
);

export const logoutAtom = atom(null, (get, set) => {
  set(userAtom, null);
  set(tokenAtom, null);
});

export const registerAtom = atom(
    null,
    async (get, set, { username, email, password }: { username: string; email: string; password: string }) => {
      const { user, token } = await api.register(username, email, password);
      set(userAtom, user);
      set(tokenAtom, token);
    }
  );

export const googleAuthAtom = atom(
    null,
    async (get, set) => {
      // Redirect to Google OAuth URL
      window.location.href = `${api.API_URL}/auth/google`;
    }
  );