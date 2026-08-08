import { apiClient } from './client.js';

export const getChannels = () => apiClient('/channels');

export const getChannelById = (id) => apiClient(`/channels/${id}`);

export const createChannel = ({ name, description, category }) => apiClient('/channels', {
  method: 'POST',
  body: { name, description, category }
});

export const updateChannel = (id, updates) => apiClient(`/channels/${id}`, {
  method: 'PATCH',
  body: updates
});

export const deleteChannel = (id) => apiClient(`/channels/${id}`, {
  method: 'DELETE'
});

export const getUnreadChannels = (userId) => {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  return apiClient(`/channels/unread${query}`);
};

export const markChannelAsRead = (channelId, userId) => apiClient(`/channels/${channelId}/read`, {
  method: 'POST',
  body: userId ? { userId } : {}
});
