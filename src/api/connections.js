import { apiClient } from './client.js';

export const getConnections = (userId) => {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  return apiClient(`/connections${query}`);
};

export const sendConnectionRequest = ({ targetUserId, senderId, receiverId }) => apiClient('/connections/request', {
  method: 'POST',
  body: { targetUserId: targetUserId || receiverId, senderId }
});

export const updateConnection = (id, actionOrStatus) => {
  const body = typeof actionOrStatus === 'string'
    ? (['accept', 'decline'].includes(actionOrStatus) ? { action: actionOrStatus } : { status: actionOrStatus })
    : actionOrStatus;
  return apiClient(`/connections/${id}`, {
    method: 'PATCH',
    body
  });
};

export const deleteConnection = (id) => apiClient(`/connections/${id}`, {
  method: 'DELETE'
});
