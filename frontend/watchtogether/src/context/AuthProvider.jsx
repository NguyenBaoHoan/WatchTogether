/**
 * 🔐 AuthProvider.jsx
 * 
 * Provider component quản lý Authentication state cho toàn bộ app
 * - Auto verify JWT token khi app load (check xem user còn login không)
 * - Cung cấp login/logout/register functions cho toàn app
 * - Persist user state trong memory (JWT token được lưu trong HttpOnly cookie)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import * as AuthService from '../services/AuthService';

export default function AuthProvider({ children }) {
  // ============================================
  // 🔒 AUTH STATE
  // ============================================
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // True lúc đầu để verify token

  // ============================================
  // 🔓 VERIFY TOKEN ON APP LOAD
  // ============================================
  useEffect(() => {
    const verifyUserToken = async () => {
      try {
        console.log('🔍 Verifying authentication token...');
        const response = await AuthService.verifyToken();

        if (response && response.user) {
          setUser(response.user);
          setIsAuthenticated(true);
          console.log('✅ User authenticated:', response.user.email);
        }
      } catch (error) {
        console.log('❌ Token verification failed:', error.message);
        // Token invalid/expired hoặc chưa login
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyUserToken();
  }, []);

  // ============================================
  // 🔐 LOGIN FUNCTION
  // ============================================
  const login = useCallback(async (email, password, rememberMe = false) => {
    try {
      console.log('🔐 Logging in user:', email);
      const response = await AuthService.login(email, password, rememberMe);

      if (response && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        console.log('✅ Login successful:', response.user.email);
        return response;
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error; // Re-throw để LoginForm có thể handle
    }
  }, []);

  // ============================================
  // 🔓 LOGOUT FUNCTION
  // ============================================
  const logout = useCallback(async () => {
    try {
      console.log('🔓 Logging out user...');
      await AuthService.logout();

      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Vẫn clear local state ngay cả khi API fail
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  }, []);

  // ============================================
  // 📝 REGISTER FUNCTION
  // ============================================
  const register = useCallback(async (userData) => {
    try {
      console.log('📝 Registering new user:', userData.email);
      const response = await AuthService.register(userData);

      if (response && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        console.log('✅ Registration successful:', response.user.email);
        return response;
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  }, []);

  // ============================================
  // 🔄 UPDATE USER FUNCTION (local only)
  // ============================================
  const updateUser = useCallback((userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData,
    }));
  }, []);

  // ============================================
  // 🎁 CONTEXT VALUE
  // ============================================
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    updateUser,
  };

  // Hiển thị loading khi đang verify token
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          <p className="mt-4 text-white text-lg">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
