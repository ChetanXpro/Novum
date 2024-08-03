import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { tokenAtom } from '@/store/authAtoms';

export const useAuthRedirect = (redirectTo: string) => {
  const router = useRouter();
  const token = useAtomValue(tokenAtom);

  useEffect(() => {
    if (!token) {
      router.push(redirectTo);
    }
  }, [token, router, redirectTo]);
};