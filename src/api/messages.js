import { apiClient } from './client.js';

export const getMessages = ({ channelId, before, limit, format } = {}) => {
  const params = new URLSearchParams();
  if (channelId) params.append('channelId', channelId);
  if (before) params.append('before', before);
  if (limit) params.append('limit', limit);
  if (format) params.append('format', format);
  const qs = params.toString();
  return apiClient(`/messages${qs ? `?${qs}` : ''}`);
};

export const getMessageById = (id) => apiClient(`/messages/${id}`);

export const sendMessage = ({ channelId, text, senderId }) => apiClient('/messages', {
  method: 'POST',
  body: { channelId, text, senderId }
});

export const editMessage = (id, { text, senderId }) => apiClient(`/messages/${id}`, {
  method: 'PATCH',
  body: { text, senderId }
});

export const deleteMessage = (id) => apiClient(`/messages/${id}`, {
  method: 'DELETE'
});
