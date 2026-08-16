import Card from '../models/Card.js';

export const getCards = async (req, res) => {
  try {
    const cards = await Card.find();
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createCard = async (req, res) => {
  try {
    const { title, description, list, priority, assignee, assignedTo, assigneeName } = req.body;
    if (!title || !list) {
      return res.status(400).json({ error: 'Title and list are required' });
    }
    const newCard = new Card({
      id: `card-${Date.now()}`,
      title,
      description: description || '',
      list,
      priority: priority || 'medium',
      assignee,
      assignedTo,
      assigneeName
    });
    const savedCard = await newCard.save();
    res.status(201).json(savedCard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCard = async (req, res) => {
  try {
    const updatedCard = await Card.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!updatedCard) return res.status(404).json({ error: 'Card not found' });
    res.status(200).json(updatedCard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const deletedCard = await Card.findOneAndDelete({ id: req.params.id });
    if (!deletedCard) return res.status(404).json({ error: 'Card not found' });
    res.status(200).json({ success: true, message: 'Card deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
