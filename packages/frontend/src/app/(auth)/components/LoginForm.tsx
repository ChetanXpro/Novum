'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useSetAtom } from 'jotai';
import { initializeUserAtom } from '../../../store/authAtoms';
import api from '../../../lib/api';
import { setToken } from '../../../lib/auth';



const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const initializeUser = useSetAtom(initializeUserAtom);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      setToken(response.data.access_token);
      await initializeUser();
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;