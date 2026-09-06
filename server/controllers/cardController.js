import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Card from '../models/Card.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'data', 'store.json');

// Helper to read JSON fallback store
function getFallbackCards() {
  if (global.rosettaDb && Array.isArray(global.rosettaDb.cards)) {
    return global.rosettaDb.cards;
  }
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      return data.cards || [];
    }
  } catch (e) {}
  return [];
}

// Helper to save JSON fallback store
function saveFallbackCards(cards) {
  if (global.rosettaDb) {
    global.rosettaDb.cards = cards;
  }
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      data.cards = cards;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    }
  } catch (e) {}
}


export const getCards = async (req, res) => {
  try {
    const { list, priority, assignee, assignedTo, search, q } = req.query;

    // Use MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (list) query.list = list;
      if (priority) query.priority = priority;
      if (assignee || assignedTo) {
        query.$or = [{ assignee: assignee || assignedTo }, { assignedTo: assignee || assignedTo }];
      }
      const searchTerm = search || q || '';
      if (searchTerm) {
        query.$or = [
          ...query.$or || [],
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ];
      }
      const cards = await Card.find(query).select('-_id -__v');
      return res.status(200).json(cards);
    }

    // Fallback store
    let cards = getFallbackCards();
    if (list) cards = cards.filter(c => c.list === list);
    if (priority) cards = cards.filter(c => c.priority === priority);
    if (assignee || assignedTo) {
      const a = assignee || assignedTo;
      cards = cards.filter(c => c.assignee === a || c.assignedTo === a);
    }
    const term = (search || q || '').toLowerCase();
    if (term) {
      cards = cards.filter(c =>
        (c.title && c.title.toLowerCase().includes(term)) ||
        (c.description && c.description.toLowerCase().includes(term))
      );
    }
    return res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createCard = async (req, res) => {
  try {
    const { title, description, list, priority, assignee, assignedTo, assigneeName } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Card title is required' });
    }

    const validPriorities = ['urgent', 'high', 'medium', 'low'];
    if (priority && !validPriorities.includes(priority.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }

    const defaultValidLists = ['todo', 'in-progress', 'review', 'done'];
    if (list && !defaultValidLists.includes(list)) {
      return res.status(400).json({ error: 'Invalid list value' });
    }

    const cardData = {
      id: `card-${Date.now()}`,
      title: title.trim(),
      description: description || '',
      list: list || 'todo',
      priority: priority || 'medium',
      assignee,
      assignedTo,
      assigneeName
    };

    if (mongoose.connection.readyState === 1) {
      const newCard = new Card(cardData);
      const savedCard = await newCard.save();
      const responseCard = savedCard.toObject();
      delete responseCard._id;
      delete responseCard.__v;
      return res.status(201).json(responseCard);
    }

    // Fallback store
    const cards = getFallbackCards();
    cards.push(cardData);
    saveFallbackCards(cards);
    return res.status(201).json(cardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCard = async (req, res) => {
  try {
    const { priority, list } = req.body;

    const validPriorities = ['urgent', 'high', 'medium', 'low'];
    if (priority !== undefined && !validPriorities.includes(priority.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }

    const defaultValidLists = ['todo', 'in-progress', 'review', 'done'];
    if (list !== undefined && !defaultValidLists.includes(list)) {
      return res.status(400).json({ error: 'Invalid list value' });
    }

    if (mongoose.connection.readyState === 1) {
      const updatedCard = await Card.findOneAndUpdate({ id: req.params.id }, req.body, { new: true }).select('-_id -__v');
      if (!updatedCard) return res.status(404).json({ error: 'Card not found' });
      return res.status(200).json(updatedCard);
    }

    // Fallback store
    const cards = getFallbackCards();
    const index = cards.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Card not found' });
    cards[index] = { ...cards[index], ...req.body };
    saveFallbackCards(cards);
    return res.status(200).json(cards[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCard = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const deletedCard = await Card.findOneAndDelete({ id: req.params.id });
      if (!deletedCard) return res.status(404).json({ error: 'Card not found' });
      return res.status(200).json({ success: true, message: 'Card deleted successfully' });
    }

    // Fallback store
    const cards = getFallbackCards();
    const index = cards.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Card not found' });
    cards.splice(index, 1);
    saveFallbackCards(cards);
    return res.status(200).json({ success: true, message: 'Card deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default { getCards, createCard, updateCard, deleteCard };
