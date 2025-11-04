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
import { authService } from '../services/authService';

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
        const response = await authService.getCurrentUser();

        if (response) {
          setUser(response);
          setIsAuthenticated(true);
          console.log('✅ User authenticated:', response.email || response.userName);
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
  const login = useCallback(async (username, password) => {
    try {
      console.log('🔐 Logging in user:', username);
      const response = await authService.login(username, password);

      // authService.login đã tự động lưu access_token vào memory
      // Bây giờ get thông tin user
      const user = await authService.getCurrentUser();

      setUser(user);
      setIsAuthenticated(true);
      console.log('✅ Login successful:', user.email || user.userName);
      return { user, ...response };
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
      await authService.logout();

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
      const response = await authService.register(userData);

      // Sau khi register, get thông tin user
      const user = await authService.getCurrentUser();

      setUser(user);
      setIsAuthenticated(true);
      console.log('✅ Registration successful:', user.email || user.userName);
      return { user, ...response };
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
