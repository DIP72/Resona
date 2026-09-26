import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AUTH_STORAGE_KEY = 'resona_auth_token';
export const AUTH_USER_KEY = 'resona_auth_user';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) || null;
  });

  const [mongoUsers, setMongoUsers] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mongoUri] = useState('mongodb://localhost:27017/resona_db');

  // Fetch list of users from MongoDB
  const fetchMongoUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        setMongoUsers(data.users || []);
        setUsersCount(data.count || 0);
      }
    } catch (err) {
      console.warn('Could not fetch MongoDB users:', err);
    }
  }, []);

  // Validate session on startup
  useEffect(() => {
    const verifySession = async () => {
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setCurrentUser(data.user);
              localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
            }
          } else {
            // Token expired or invalid
            logout();
          }
        } catch {
          // If server is starting up, retain cached user
        }
      }
      setLoading(false);
      fetchMongoUsers();
    };

    verifySession();
  }, [token, fetchMongoUsers]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem(AUTH_STORAGE_KEY, data.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));

      await fetchMongoUsers();
      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Register handler (Stores directly to MongoDB)
  const register = async (formData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.');
      }

      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem(AUTH_STORAGE_KEY, data.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));

      await fetchMongoUsers();
      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Quick Demo Login for testing
  const quickLogin = async (email, password = 'Password123!') => {
    return await login(email, password);
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const value = {
    currentUser,
    token,
    isAuthenticated: !!currentUser,
    loading,
    mongoUsers,
    usersCount,
    mongoUri,
    login,
    register,
    quickLogin,
    logout,
    fetchMongoUsers
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
