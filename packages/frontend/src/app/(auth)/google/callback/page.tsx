'use client'
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { setToken } from '../../../../lib/auth';
import { userAtom } from '../../../../store/authAtoms';
import { fetchUserInfo } from '../../../../lib/api';

const GoogleCallback = () => {
  const router = useRouter();
  const setUser = useSetAtom(userAtom);
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token && typeof token === 'string') {
      setToken(token);
      fetchUserInfo()
        .then((user) => {
          setUser(user);
          router.push('/feed');
        })
        .catch((err) => {
          console.error('Failed to fetch user info:', err);
          setError('Failed to complete login. Please try again.');
        });
    } else {
      setError('No token received. Please try logging in again.');
    }
  }, [searchParams, setUser, router]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Processing Google login... Please wait.</div>;
};

export default GoogleCallback;