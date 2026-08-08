import { apiClient, tokenStore } from './client.js';

export const register = async ({ name, email, username, password, role, avatar }) => {
  const data = await apiClient('/auth/register', {
    method: 'POST',
    body: { name, email, username, password, role, avatar }
  });
  if (data.token) {
    tokenStore.setToken(data.token);
  }
  return data;
};

export const login = async ({ identifier, username, email, password }) => {
  const data = await apiClient('/auth/login', {
    method: 'POST',
    body: { identifier: identifier || username || email, password }
  });
  if (data.token) {
    tokenStore.setToken(data.token);
  }
  return data;
};

export const logout = async () => {
  try {
    await apiClient('/auth/logout', { method: 'POST' });
  } finally {
    tokenStore.removeToken();
  }
  return { success: true };
};

export const refreshToken = async () => {
  const data = await apiClient('/auth/refresh', { method: 'POST' });
  if (data.token) {
    tokenStore.setToken(data.token);
  }
  return data;
};

export const getMe = () => apiClient('/auth/me');

export const updateMe = (updates) => apiClient('/auth/me', {
  method: 'PATCH',
  body: updates
});

export const updatePassword = ({ currentPassword, newPassword }) => apiClient('/auth/me/password', {
  method: 'PATCH',
  body: { currentPassword, newPassword }
});

export const getUsers = (search = '') => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiClient(`/auth/users${query}`);
};

export const getUserById = (id) => apiClient(`/auth/users/${id}`);
