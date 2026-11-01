// client/src/services/api.js
import { API_BASE_URL } from '../constants/config';

let storedToken = null;

export const setAuthToken = (token) => {
  storedToken = token;
  try {
    if (typeof localStorage !== 'undefined') {
      if (token) localStorage.setItem('rosetta_token', token);
      else localStorage.removeItem('rosetta_token');
    }
  } catch (e) {}
};

export const getAuthToken = () => {
  if (storedToken) return storedToken;
  try {
    if (typeof localStorage !== 'undefined') {
      storedToken = localStorage.getItem('rosetta_token');
    }
  } catch (e) {}
  return storedToken;
};

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body) {
    fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || data.error || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = data;
      error.isRateLimited = response.status === 429;
      error.retryAfter = data.retryAfterSeconds || 180;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, err);
    throw err;
  }
};

