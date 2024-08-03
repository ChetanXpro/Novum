'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSetToken } from '@/lib/auth';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setToken = useSetToken();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setToken(token);
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [searchParams, setToken, router]);

  return <div>Processing authentication...</div>;
}