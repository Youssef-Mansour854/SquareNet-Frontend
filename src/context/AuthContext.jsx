import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext();

const CURRENT_USER_STORAGE_KEY = 'squareNetCurrentUser';
const TOKEN_KEY = 'squareNetAuthToken';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://squarenet-backend-production.up.railway.app';

const readStoredJson = (key, fallbackValue) => {
  try {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) : fallbackValue;
  } catch (error) {
    console.error(`Failed to read ${key} from sessionStorage`, error);
    return fallbackValue;
  }
};

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  const {
    password,
    __v,
    passwordResetCode,
    passwordResetExpires,
    passwordResetVerified,
    ...safeUser
  } = user;

  return {
    ...safeUser,
    id: safeUser.id || safeUser._id,
    _id: safeUser._id || safeUser.id,
    fullName: safeUser.fullName || safeUser.name || '',
    name: safeUser.name || safeUser.fullName || '',
  };
};

const parseResponseBody = async (response) => {
  const responseText = await response.text();

  if (!responseText) {
    return {};
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Failed to parse API response', error);
    return {};
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => normalizeUser(readStoredJson(CURRENT_USER_STORAGE_KEY, null)));
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || null);

  const persistAuthState = (responseBody) => {
    const normalizedUser = normalizeUser(responseBody.data);

    sessionStorage.setItem(TOKEN_KEY, responseBody.token);
    sessionStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(normalizedUser));
    setToken(responseBody.token);
    setCurrentUser(normalizedUser);

    return normalizedUser;
  };

  const updateCurrentUser = (partialUser) => {
    setCurrentUser((prev) => {
      const merged = normalizeUser({ ...(prev || {}), ...(partialUser || {}) });
      sessionStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    });
  };

  const register = async ({ fullName, email, phone, password, confirmPassword, accountType }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          phone,
          password,
          passwordConfirm: confirmPassword,
          accountType,
          role: 'user',
        }),
      });

      const resData = await parseResponseBody(res);

      if (res.ok) {
        return { ok: true, user: persistAuthState(resData) };
      }

      return {
        ok: false,
        message: resData.message || resData.errors?.[0]?.msg || 'تعذر إنشاء الحساب. راجع البيانات وحاول مرة أخرى.',
      };
    } catch (err) {
      console.error(err);
      return { ok: false, message: 'تعذر الاتصال بالخادم. تأكد أن الـ back-end يعمل على المنفذ 3000.' };
    }
  };

  const login = async ({ email, password }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const resData = await parseResponseBody(res);

      if (res.ok) {
        return { ok: true, user: persistAuthState(resData) };
      }

      return {
        ok: false,
        message: resData.message || resData.errors?.[0]?.msg || 'بيانات تسجيل الدخول غير صحيحة.',
      };
    } catch (err) {
      console.error(err);
      return { ok: false, message: 'تعذر الاتصال بالخادم. تأكد أن الـ back-end يعمل على المنفذ 3000.' };
    }
  };

  const logout = () => {
    sessionStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    setCurrentUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      currentUser,
      token,
      isAuthenticated: Boolean(currentUser),
      login,
      register,
      logout,
      updateCurrentUser,
    }),
    [currentUser, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
