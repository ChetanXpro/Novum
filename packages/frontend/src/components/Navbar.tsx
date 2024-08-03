'use client';

import Link from 'next/link';
import { useAtom, useAtomValue } from 'jotai';
import { userAtom, logoutAtom } from '@/store/authAtoms';

const Navbar = () => {
  const user = useAtomValue(userAtom);
  const [, logout] = useAtom(logoutAtom);

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Video Platform
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/feed" className="hover:text-gray-300">
            Feed
          </Link>
          {user ? (
            <>
              <Link href="/upload" className="hover:text-gray-300">
                Upload
              </Link>
              <div className="relative group">
                <img
                  src={user.profilePicUrl || '/default-avatar.png'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full cursor-pointer"
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profile
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-gray-300">
                Login
              </Link>
              <Link href="/register" className="hover:text-gray-300">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;