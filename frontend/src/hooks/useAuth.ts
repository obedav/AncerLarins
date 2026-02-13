'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import type { RootState } from '@/store/store';
import { setUser, clearUser } from '@/store/slices/authSlice';
import { useGetMeQuery, useLogoutMutation } from '@/store/api/authApi';
import { setTokens, clearTokens, isAuthenticated as checkAuth } from '@/lib/auth';
import type { User, AuthTokens } from '@/types';

export function useAuth() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [logoutApi] = useLogoutMutation();

  const { refetch: refetchMe } = useGetMeQuery(undefined, {
    skip: !checkAuth(),
  });

  const loginSuccess = useCallback(
    (userData: User, tokens: AuthTokens) => {
      setTokens(tokens.access_token, tokens.refresh_token);
      dispatch(setUser(userData));
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // Logout even if API fails
    }
    clearTokens();
    dispatch(clearUser());
  }, [dispatch, logoutApi]);

  const refreshUser = useCallback(async () => {
    const result = await refetchMe();
    if (result.data?.data) {
      dispatch(setUser(result.data.data));
    }
  }, [dispatch, refetchMe]);

  return {
    user,
    isAuthenticated,
    loginSuccess,
    logout,
    refreshUser,
  };
}
