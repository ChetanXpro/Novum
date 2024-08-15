'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { initializeUserAtom } from '../../../store/authAtoms';
import api from '../../../lib/api';
import { setToken } from '../../../lib/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FaGoogle } from 'react-icons/fa';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const initializeUser = useSetAtom(initializeUserAtom);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      setToken(response.data.access_token);
      await initializeUser();
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Card className="w-full max-w-md bg-gray-800 text-gray-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">Login</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            {error && (
              <Alert variant="destructive" className="bg-red-900 border-red-800 text-red-100">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Sign In
            </Button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="bg-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-800 px-2 text-gray-400">Or continue with</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
            onClick={handleGoogleLogin}
          >
            <FaGoogle className="mr-2 h-4 w-4" /> Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-gray-400">
          <a href="#" className="hover:text-gray-200">
            Forgot your password?
          </a>
          <div>
            Don't have an account?{' '}
            <a href="#" className="font-semibold text-blue-400 hover:text-blue-300">
              Sign up
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;