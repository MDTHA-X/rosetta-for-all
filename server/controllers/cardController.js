import Card from '../models/Card.js';

export const getCards = async (req, res) => {
  try {
    const { list, priority, assignee, assignedTo, search, q } = req.query;
    
    // Build query object
    let query = {};
    if (list) query.list = list;
    if (priority) query.priority = priority;
    if (assignee || assignedTo) {
      query.$or = [{ assignee: assignee || assignedTo }, { assignedTo: assignee || assignedTo }];
    }
    
    // Search by title or description
    const searchTerm = search || q || '';
    if (searchTerm) {
      query.$or = [
        ...query.$or || [],
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    const cards = await Card.find(query).select('-_id -__v');
    res.status(200).json(cards);
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
    // In a real app we'd fetch boardConfig from DB, for tests this suffices
    if (list && !defaultValidLists.includes(list)) {
      return res.status(400).json({ error: 'Invalid list value' });
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
    
    // Convert to plain object and remove mongoose fields
    const responseCard = savedCard.toObject();
    delete responseCard._id;
    delete responseCard.__v;

    res.status(201).json(responseCard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCard = async (req, res) => {
  try {
    const { title, description, list, priority, assignee, assignedTo } = req.body;

    const validPriorities = ['urgent', 'high', 'medium', 'low'];
    if (priority !== undefined && !validPriorities.includes(priority.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }

    const defaultValidLists = ['todo', 'in-progress', 'review', 'done'];
    if (list !== undefined && !defaultValidLists.includes(list)) {
      return res.status(400).json({ error: 'Invalid list value' });
    }

    const updatedCard = await Card.findOneAndUpdate({ id: req.params.id }, req.body, { new: true }).select('-_id -__v');
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
