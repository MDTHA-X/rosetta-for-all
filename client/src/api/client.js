const BASE_URL = '/api';

let memoryToken = null;
let onUnauthorizedCallback = null;

export const tokenStore = {
  getToken: () => memoryToken || localStorage.getItem('rosettaToken') || null,
  setToken: (token) => {
    memoryToken = token;
    if (token) {
      localStorage.setItem('rosettaToken', token);
    } else {
      localStorage.removeItem('rosettaToken');
    }
  },
  removeToken: () => {
    memoryToken = null;
    localStorage.removeItem('rosettaToken');
    localStorage.removeItem('rosettaUser');
  },
  onUnauthorized: (cb) => {
    onUnauthorizedCallback = cb;
  }
};

export async function apiClient(endpoint, { body, headers = {}, ...customConfig } = {}) {
  const token = tokenStore.getToken();

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers
    }
  };

  if (body) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      tokenStore.removeToken();
      if (typeof onUnauthorizedCallback === 'function') {
        onUnauthorizedCallback();
      }
    }

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg = (typeof data === 'object' && (data.error || data.message)) || `HTTP Error ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    return Promise.reject(error);
  }
}
