import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

export const getInitialData = () => ({
  boardConfig: {
    title: "Sprint Alpha Board",
    columns: [
      { id: "todo", title: "To Do", name: "To Do", limit: null },
      { id: "in-progress", title: "In Progress", name: "In Progress", limit: 3 },
      { id: "review", title: "Review", name: "Review", limit: 4 },
      { id: "done", title: "Done", name: "Done", limit: null }
    ]
  },
  channelReads: [],
  users: [
    { id: "u-1", name: "Tanjim Hossen", email: "tanjim@rosetta.local", username: "tanjim", password: "password123", role: "Admin", status: "online", customStatus: "Building Rosetta 🚀", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", createdAt: new Date().toISOString() },
    { id: "u-2", name: "Alex Rivera", email: "alex@rosetta.local", username: "arivera", password: "password123", role: "Lead Developer", status: "online", customStatus: "Refactoring APIs", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", createdAt: new Date().toISOString() },
    { id: "u-3", name: "Sarah Chen", email: "sarah@rosetta.local", username: "schen", password: "password123", role: "Product Designer", status: "idle", customStatus: "Designing Kanban UI", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", createdAt: new Date().toISOString() },
    { id: "u-4", name: "Marcus Vance", email: "marcus@rosetta.local", username: "mvance", password: "password123", role: "QA Engineer", status: "dnd", customStatus: "Testing Known Network", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", createdAt: new Date().toISOString() }
  ],
  connections: [
    { id: "conn-1", senderId: "u-3", receiverId: "u-1", status: "pending", createdAt: new Date().toISOString() }
  ],
  channels: [
    { id: "c-1", name: "general", description: "General community and team discussions", category: "Text Channels", isDefault: false, createdAt: new Date().toISOString() },
    { id: "c-2", name: "dev-talk", description: "Engineering, architecture, and code reviews", category: "Text Channels", isDefault: false, createdAt: new Date().toISOString() },
    { id: "c-3", name: "announcements", description: "Official updates and release notices", category: "Information", isDefault: false, createdAt: new Date().toISOString() }
  ],
  members: [
    { id: "m-1", name: "Tanjim Hossen", email: "tanjim@rosetta.local", username: "tanjim", role: "Admin", status: "online", customStatus: "Building Rosetta 🚀", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", createdAt: new Date().toISOString() },
    { id: "m-2", name: "Alex Rivera", email: "alex@rosetta.local", username: "arivera", role: "Lead Developer", status: "online", customStatus: "Refactoring APIs", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", createdAt: new Date().toISOString() },
    { id: "m-3", name: "Sarah Chen", email: "sarah@rosetta.local", username: "schen", role: "Product Designer", status: "idle", customStatus: "Designing Kanban UI", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", createdAt: new Date().toISOString() },
    { id: "m-4", name: "Marcus Vance", email: "marcus@rosetta.local", username: "mvance", role: "QA Engineer", status: "dnd", customStatus: "Testing Known Network", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", createdAt: new Date().toISOString() }
  ],
  messages: [
    { id: "msg-1", channelId: "c-1", memberId: "u-1", senderId: "u-1", senderName: "Tanjim Hossen", senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", text: "Welcome to Rosetta! Messages and Board stand side-by-side.", edited: false, isEdited: false, timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: "msg-2", channelId: "c-1", memberId: "u-2", senderId: "u-2", senderName: "Alex Rivera", senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", text: "You can edit your messages and customize board names at any time.", edited: false, isEdited: false, timestamp: new Date(Date.now() - 1800000).toISOString() }
  ],
  cards: [
    { id: "card-1", title: "Setup Azure VPS Deployment", description: "Configure Docker Compose, reverse proxy, and SSL on VM 40.83.100.54", list: "done", priority: "high", assignee: "u-1", assignedTo: "u-1", assigneeName: "Tanjim Hossen", createdAt: new Date().toISOString() },
    { id: "card-2", title: "Build Side-by-Side Dual Pane", description: "Place Messages & Board side by side with collapsible controls", list: "done", priority: "urgent", assignee: "u-2", assignedTo: "u-2", assigneeName: "Alex Rivera", createdAt: new Date().toISOString() },
    { id: "card-3", title: "Implement User Auth & Known Network", description: "Allow users to register with email, login, and send friend/known requests", list: "in-progress", priority: "high", assignee: "u-1", assignedTo: "u-1", assigneeName: "Tanjim Hossen", createdAt: new Date().toISOString() },
    { id: "card-4", title: "Automated API Regression Gates", description: "Maintain 100 Postman assertions across all endpoints", list: "todo", priority: "medium", assignee: "u-4", assignedTo: "u-4", assigneeName: "Marcus Vance", createdAt: new Date().toISOString() }
  ]
});

// Persistence helpers
export function loadData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.boardConfig) parsed.boardConfig = getInitialData().boardConfig;
    if (!parsed.users) parsed.users = getInitialData().users;
    if (!parsed.connections) parsed.connections = getInitialData().connections;
    if (!parsed.channelReads) parsed.channelReads = [];
    if (!parsed.cards) parsed.cards = getInitialData().cards;
    if (!parsed.channels) parsed.channels = getInitialData().channels;
    if (!parsed.messages) parsed.messages = getInitialData().messages;
    if (!parsed.members) parsed.members = getInitialData().members;
    return parsed;
  } catch (err) {
    console.error('Error loading data:', err);
    return getInitialData();
  }
}

export function saveData(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving data:', err);
  }
}

export const db = loadData();
global.rosettaDb = db;

// Utility helper to strip sensitive fields
export const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
};

export function resetDb() {
  const initial = getInitialData();
  db.boardConfig = initial.boardConfig;
  db.users = initial.users;
  db.connections = initial.connections;
  db.channelReads = initial.channelReads;
  db.cards = initial.cards;
  db.channels = initial.channels;
  db.messages = initial.messages;
  db.members = initial.members;
  saveData(db);
  return db;
}
