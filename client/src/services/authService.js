// client/src/services/authService.js
import { apiRequest, setAuthToken } from './api';

export const AuthService = {
  login: async (username, password) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: { username, password },
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  getCurrentUser: async () => {
    return await apiRequest('/auth/me');
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (e) {}
    setAuthToken(null);
  },

  changePassword: async (old_password, new_password, confirm_password) => {
    return await apiRequest('/auth/change-password', {
      method: 'PUT',
      body: { old_password, new_password, confirm_password },
    });
  },

  getAllAdmins: async () => {
    return await apiRequest('/admins');
  },

  createAdmin: async (adminData) => {
    return await apiRequest('/admins', {
      method: 'POST',
      body: adminData,
    });
  },

  deleteAdmin: async (adminId) => {
    return await apiRequest(`/admins/${adminId}`, {
      method: 'DELETE',
    });
  },
};
