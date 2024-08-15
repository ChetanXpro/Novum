import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  exp: number;
}

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;

  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp > currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return false;
  }
};

export const isAuthenticated = (): boolean => {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    console.log('Server-side authentication check');
    // For server-side, we can't access localStorage, so we'll need to implement
    // a different strategy, such as checking cookies or headers
    // For now, we'll return false to ensure protected routes redirect to login
    return false;
  }

  const token = getToken();
  const isValid = isTokenValid(token);
  console.log('Client-side authentication check:', isValid);
  return isValid;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};