'use client'

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { removeToken } from '../lib/auth';
import { useSetAtom } from 'jotai';
import { userAtom } from '../store/authAtoms';

const Header = () => {
  const { user, isAuthenticated } = useAuth();
  const setUser = useSetAtom(userAtom);

  const handleLogout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <header className="flex justify-between items-center p-4 border">
      <Link href="/">Home</Link>
      {isAuthenticated ? (
        <>
          <nav>
            <Link href="/dashboard" className="mr-4">Dashboard</Link>
            <Link href="/upload" className="mr-4">Upload</Link>
            <Link href="/feed" className="mr-4">Feed</Link>
          </nav>
          <div className="flex items-center">
            <span className="mr-4">{user?.username}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </>
      ) : (
        <Link href="/login">Login</Link>
      )}
    </header>
  );
};

export default Header;