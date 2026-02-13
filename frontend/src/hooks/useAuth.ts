'use client';

import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import { login, register, logout, fetchMe } from '@/store/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, loading, error } = useSelector((state: RootState) => state.auth);

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    login: (credentials: { email: string; password: string }) => dispatch(login(credentials)),
    register: (data: { name: string; email: string; phone: string; password: string; password_confirmation: string; role?: string }) => dispatch(register(data)),
    logout: () => dispatch(logout()),
    fetchMe: () => dispatch(fetchMe()),
  };
}
