// context/AuthContext.js
"use client"; // This marks the component as a client component

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      router.push('/login'); // Redirect to login if no token
    }
  }, [router]);

  const login = async (email, password) => {
    const response = await fetch(process.env.NEXT_PUBLIC_URL + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.token) {
      sessionStorage.setItem('token', data.token);
      setToken(data.token);
      router.push('/'); // Redirect to home after login
    } else {
      throw new Error(data.message || 'Login failed');
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
