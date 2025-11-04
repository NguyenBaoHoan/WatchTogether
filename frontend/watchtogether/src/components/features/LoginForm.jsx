/**
 * 🔐 LoginForm.jsx
 * 
 * Form component hiện đại cho Login
 * 
 * Features:
 * - Real-time validation
 * - Password show/hide toggle
 * - Remember me checkbox
 * - Loading states
 * - Error messages
 * - Social login buttons
 * - Responsive design
 * - Glass morphism UI
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Loader, Github } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { socialLogin } from '../../services/authService';

export default function LoginForm({ onSuccess, onSwitchToRegister }) {
  // ============================================
  // 📝 FORM STATE
  // ============================================
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const { login } = useAuth();

  // ============================================
  // 📝 INPUT CHANGE HANDLER
  // ============================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error khi user bắt đầu sửa
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  // ============================================
  // ✅ VALIDATION
  // ============================================
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // 📤 FORM SUBMIT
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Validate form
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password, formData.rememberMe);

      // Success - redirect hoặc callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setServerError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // 🌐 SOCIAL LOGIN
  // ============================================
  const handleSocialLogin = (provider) => {
    const url = socialLogin(provider);
    window.location.href = url;
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-gray-300">Sign in to continue watching together</p>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
          {serverError}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 bg-white/10 border ${errors.email ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all`}
              placeholder="your@email.com"
              autoComplete="email"
              autoFocus
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-10 pr-12 py-3 bg-white/10 border ${errors.password ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all`}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">{errors.password}</p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-600 bg-white/10 text-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-0 cursor-pointer"
            />
            <span className="ml-2 text-sm text-gray-300">Remember me</span>
          </label>
          <a href="#" className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors">
            Forgot password?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <Loader className="animate-spin mr-2" size={20} />
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-gray-600"></div>
        <span className="px-4 text-sm text-gray-400">or continue with</span>
        <div className="flex-1 border-t border-gray-600"></div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleSocialLogin('google')}
          className="flex items-center justify-center px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white hover:bg-white/20 transition-all"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>

        <button
          type="button"
          onClick={() => handleSocialLogin('github')}
          className="flex items-center justify-center px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white hover:bg-white/20 transition-all"
        >
          <Github className="mr-2" size={20} />
          GitHub
        </button>
      </div>

      {/* Sign Up Link */}
      <div className="mt-6 text-center">
        <p className="text-gray-300">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
