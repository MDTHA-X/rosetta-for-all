import mongoose from 'mongoose';
import Card from '../models/Card.js';

const seedData = async () => {
  try {
    const count = await Card.countDocuments();
    if (count === 0) {
      console.log('Seeding initial cards...');
      const initialCards = [
        { id: "card-1", title: "Setup Azure VPS Deployment", description: "Configure Docker Compose, reverse proxy, and SSL on VM 40.83.100.54", list: "done", priority: "high", assignee: "u-1", assignedTo: "u-1", assigneeName: "Tanjim Hossen", createdAt: new Date().toISOString() },
        { id: "card-2", title: "Build Side-by-Side Dual Pane", description: "Place Messages & Board side by side with collapsible controls", list: "done", priority: "urgent", assignee: "u-2", assignedTo: "u-2", assigneeName: "Alex Rivera", createdAt: new Date().toISOString() },
        { id: "card-3", title: "Implement User Auth & Known Network", description: "Allow users to register with email, login, and send friend/known requests", list: "in-progress", priority: "high", assignee: "u-1", assignedTo: "u-1", assigneeName: "Tanjim Hossen", createdAt: new Date().toISOString() },
        { id: "card-4", title: "Automated API Regression Gates", description: "Maintain 100 Postman assertions across all endpoints", list: "todo", priority: "medium", assignee: "u-4", assignedTo: "u-4", assigneeName: "Marcus Vance", createdAt: new Date().toISOString() }
      ];
      await Card.insertMany(initialCards);
      console.log('Initial cards seeded successfully.');
    }
  } catch (error) {
    console.error('Error seeding data:', error);
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
