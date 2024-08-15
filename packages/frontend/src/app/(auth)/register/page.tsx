'use client';

import { useState } from 'react';
// import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { register } from '../../../lib/api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const { registe } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(username, email, password);
    } catch (error) {
      console.error('Registration failed', error);
    }
  };

  const handleGoogleAuth = async () => {
    // This function should initiate the Google OAuth flow
    // For example, redirect to your backend's Google auth endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };


  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block mb-1">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Register
        </button>
      </form>
      <div className="mt-4 text-center">
        <span className="text-gray-500">or</span>
      </div>
      <button
        onClick={handleGoogleAuth}
        className="w-full mt-4 p-2 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
      >
        <Image src="/google-logo.png" alt="Google logo" width={20} height={20} className="mr-2" />
        Sign up with Google
      </button>
    </div>
  );
}