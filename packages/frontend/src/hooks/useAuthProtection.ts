import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated } from '../lib/auth';

export const useAuthProtection = (redirectTo: string = '/login') => {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(redirectTo);
    }
  }, [redirectTo, router]);

  return isAuthenticated();
};