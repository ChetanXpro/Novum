'use client'

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../store/authAtoms';
import { isAuthenticated as checkAuth, removeToken } from '../lib/auth';

export const useAuth = () => {
  const [user, setUser] = useAtom(userAtom);

  useEffect(() => {
    const checkAuthStatus = () => {
      if (checkAuth()) {
        if (!user) {
          // If there's no user but the token is valid, we'll fetch the user data in AuthProvider
        }
      } else {
        removeToken();
        setUser(null);
      }
    };

    checkAuthStatus();
  }, [user, setUser]);

  return { user, isAuthenticated: checkAuth() };
};