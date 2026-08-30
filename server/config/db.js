import mongoose from 'mongoose';
import Card from '../models/Card.js';
import User from '../models/User.js';
import Channel from '../models/Channel.js';
import Message from '../models/Message.js';
import Connection from '../models/Connection.js';
import Member from '../models/Member.js';
import BoardConfig from '../models/BoardConfig.js';

const seedData = async () => {
  try {
    // Seed Cards
    if (await Card.countDocuments() === 0) {
      console.log('Seeding initial cards...');
      await Card.insertMany([
        { id: "card-1", title: "Setup Azure VPS Deployment", description: "Configure Docker Compose, reverse proxy, and SSL on VM 40.83.100.54", list: "done", priority: "high", assignee: "u-1", assignedTo: "u-1", assigneeName: "Tanjim Hossen" },
        { id: "card-2", title: "Build Side-by-Side Dual Pane", description: "Place Messages & Board side by side with collapsible controls", list: "done", priority: "urgent", assignee: "u-2", assignedTo: "u-2", assigneeName: "Alex Rivera" },
        { id: "card-3", title: "Implement User Auth & Known Network", description: "Allow users to register with email, login, and send friend/known requests", list: "in-progress", priority: "high", assignee: "u-1", assignedTo: "u-1", assigneeName: "Tanjim Hossen" },
        { id: "card-4", title: "Automated API Regression Gates", description: "Maintain 100 Postman assertions across all endpoints", list: "todo", priority: "medium", assignee: "u-4", assignedTo: "u-4", assigneeName: "Marcus Vance" }
      ]);
    }

    // Seed Users
    if (await User.countDocuments() === 0) {
      console.log('Seeding initial users...');
      await User.insertMany([
        { id: "u-1", name: "Tanjim Hossen", email: "tanjim@rosetta.local", username: "tanjim", password: "password123", role: "Admin", status: "online", customStatus: "Building Rosetta 🚀", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
        { id: "u-2", name: "Alex Rivera", email: "alex@rosetta.local", username: "arivera", password: "password123", role: "Lead Developer", status: "online", customStatus: "Refactoring APIs", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
        { id: "u-3", name: "Sarah Chen", email: "sarah@rosetta.local", username: "schen", password: "password123", role: "Product Designer", status: "idle", customStatus: "Designing Kanban UI", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
        { id: "u-4", name: "Marcus Vance", email: "marcus@rosetta.local", username: "mvance", password: "password123", role: "QA Engineer", status: "dnd", customStatus: "Testing Known Network", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" }
      ]);
    }

    // Seed Channels
    if (await Channel.countDocuments() === 0) {
      console.log('Seeding initial channels...');
      await Channel.insertMany([
        { id: "c-1", name: "general", description: "General community and team discussions", category: "Text Channels", isDefault: false },
        { id: "c-2", name: "dev-talk", description: "Engineering, architecture, and code reviews", category: "Text Channels", isDefault: false },
        { id: "c-3", name: "announcements", description: "Official updates and release notices", category: "Information", isDefault: false }
      ]);
    }

    // Seed Members
    if (await Member.countDocuments() === 0) {
      console.log('Seeding initial members...');
      await Member.insertMany([
        { id: "m-1", name: "Tanjim Hossen", email: "tanjim@rosetta.local", username: "tanjim", role: "Admin", status: "online", customStatus: "Building Rosetta 🚀", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
        { id: "m-2", name: "Alex Rivera", email: "alex@rosetta.local", username: "arivera", role: "Lead Developer", status: "online", customStatus: "Refactoring APIs", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
        { id: "m-3", name: "Sarah Chen", email: "sarah@rosetta.local", username: "schen", role: "Product Designer", status: "idle", customStatus: "Designing Kanban UI", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
        { id: "m-4", name: "Marcus Vance", email: "marcus@rosetta.local", username: "mvance", role: "QA Engineer", status: "dnd", customStatus: "Testing Known Network", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" }
      ]);
    }

    // Seed Messages
    if (await Message.countDocuments() === 0) {
      console.log('Seeding initial messages...');
      await Message.insertMany([
        { id: "msg-1", channelId: "c-1", memberId: "u-1", senderId: "u-1", senderName: "Tanjim Hossen", senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", text: "Welcome to Rosetta! Messages and Board stand side-by-side.", edited: false, isEdited: false },
        { id: "msg-2", channelId: "c-1", memberId: "u-2", senderId: "u-2", senderName: "Alex Rivera", senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", text: "You can edit your messages and customize board names at any time.", edited: false, isEdited: false }
      ]);
    }

    // Seed Connections
    if (await Connection.countDocuments() === 0) {
      console.log('Seeding initial connections...');
      await Connection.insertMany([
        { id: "conn-1", senderId: "u-3", receiverId: "u-1", status: "pending" }
      ]);
    }

    // Seed BoardConfig
    if (await BoardConfig.countDocuments() === 0) {
      console.log('Seeding initial board config...');
      await BoardConfig.create({
        title: "Sprint Alpha Board",
        columns: [
          { id: "todo", title: "To Do", name: "To Do", limit: null },
          { id: "in-progress", title: "In Progress", name: "In Progress", limit: 3 },
          { id: "review", title: "Review", name: "Review", limit: 4 },
          { id: "done", title: "Done", name: "Done", limit: null }
        ]
      });
    }

    console.log('All initial MongoDB seed data verified.');
  } catch (error) {
    console.error('Error seeding MongoDB data:', error);
  }
};

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/rosetta';
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedData();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
