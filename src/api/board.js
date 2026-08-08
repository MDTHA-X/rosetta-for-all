import { apiClient } from './client.js';

export const getBoardConfig = () => apiClient('/board/config');

export const updateBoardConfig = ({ title, columns }) => apiClient('/board/config', {
  method: 'PATCH',
  body: { title, columns }
});
