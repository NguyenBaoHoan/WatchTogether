/**
 * 🔐 AuthService.jsx
 * 
 * Service xử lý tất cả các API calls liên quan đến Authentication
 * - Login/Logout
 * - Register
 * - Verify token
 * - Get current user
 * - Refresh token
 * 
 * Sử dụng credentials: 'include' để gửi/nhận HttpOnly cookies (JWT)
 */

const API_BASE = '/api/auth'; // Vite proxy sẽ forward tới backend

/**
 * Login user với email và password
 * @param {string} email 
 * @param {string} password 
 * @param {boolean} rememberMe 
 * @returns {Promise<Object>} User data
 */
export const login = async (email, password, rememberMe = false) => {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // ⭐ Quan trọng: để nhận JWT cookie từ server
      body: JSON.stringify({ email, password, rememberMe }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data; // { user: { id, email, name, avatar }, token (optional) }
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
};

/**
 * Logout user (xóa JWT cookie)
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    const response = await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Logout error:', error);
    throw error;
  }
};

/**
 * Register user mới
 * @param {Object} userData - { name, email, password }
 * @returns {Promise<Object>} User data
 */
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Register error:', error);
    throw error;
  }
};

/**
 * Verify JWT token hiện tại (check xem user còn login không)
 * @returns {Promise<Object>} User data nếu valid
 */
export const verifyToken = async () => {
  try {
    const response = await fetch(`${API_BASE}/verify`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Token invalid or expired');
    }

    return await response.json(); // { user: {...} }
  } catch (error) {
    console.error('❌ Verify token error:', error);
    throw error;
  }
};

/**
 * Get thông tin user hiện tại
 * @returns {Promise<Object>} Current user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE}/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Not authenticated');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Get current user error:', error);
    throw error;
  }
};

/**
 * Refresh JWT token (nếu backend support)
 * @returns {Promise<Object>} New token data
 */
export const refreshToken = async () => {
  try {
    const response = await fetch(`${API_BASE}/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Cannot refresh token');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Refresh token error:', error);
    throw error;
  }
};

/**
 * Request password reset
 * @param {string} email 
 * @returns {Promise<Object>}
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_BASE}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Password reset request error:', error);
    throw error;
  }
};

/**
 * Social login (Google, GitHub, etc.)
 * @param {string} provider - 'google' | 'github' | 'facebook'
 * @returns {string} Redirect URL
 */
export const socialLogin = (provider) => {
  // Backend sẽ redirect về callback URL sau khi auth thành công
  return `${API_BASE}/social/${provider}`;
};
