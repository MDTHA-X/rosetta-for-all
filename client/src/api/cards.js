import { apiClient } from './client.js';

export const getCards = ({ list, priority, assignee, assignedTo, search } = {}) => {
  const params = new URLSearchParams();
  if (list) params.append('list', list);
  if (priority) params.append('priority', priority);
  if (assignee || assignedTo) params.append('assignee', assignee || assignedTo);
  if (search) params.append('search', search);
  const qs = params.toString();
  return apiClient(`/cards${qs ? `?${qs}` : ''}`);
};

export const getCardById = (id) => apiClient(`/cards/${id}`);

export const createCard = ({ title, description, list, priority, assignee, assignedTo }) => apiClient('/cards', {
  method: 'POST',
  body: {
    title,
    description,
    list: list || 'todo',
    priority: priority || 'medium',
    assignee: assignee || assignedTo,
    assignedTo: assignee || assignedTo
  }
});

export const updateCard = (id, updates) => apiClient(`/cards/${id}`, {
  method: 'PATCH',
  body: updates
});

export const deleteCard = (id) => apiClient(`/cards/${id}`, {
  method: 'DELETE'
});
