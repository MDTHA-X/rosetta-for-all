export * from './client.js';
export * as systemApi from './system.js';
export * as authApi from './auth.js';
export * as connectionsApi from './connections.js';
export * as channelsApi from './channels.js';
export * as messagesApi from './messages.js';
export * as boardApi from './board.js';
export * as cardsApi from './cards.js';

export {
  getHealth,
  getStats
} from './system.js';

export {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateMe,
  updatePassword,
  getUsers,
  getUserById
} from './auth.js';

export {
  getConnections,
  sendConnectionRequest,
  updateConnection,
  deleteConnection
} from './connections.js';

export {
  getChannels,
  getChannelById,
  createChannel,
  updateChannel,
  deleteChannel,
  getUnreadChannels,
  markChannelAsRead
} from './channels.js';

export {
  getMessages,
  getMessageById,
  sendMessage,
  editMessage,
  deleteMessage
} from './messages.js';

export {
  getBoardConfig,
  updateBoardConfig
} from './board.js';

export {
  getCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard
} from './cards.js';
