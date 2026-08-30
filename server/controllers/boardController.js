import { getDb, saveData, getInitialData } from '../data/store.js';

export const getBoardConfig = (req, res) => {
  const db = getDb();
  const config = db.boardConfig || getInitialData().boardConfig;
  const columns = config.columns.map(c => ({
    id: c.id,
    name: c.name || c.title || c.id,
    title: c.title || c.name || c.id,
    limit: c.limit || null
  }));
  res.status(200).json({
    title: config.title,
    columns
  });
};

export const updateBoardConfig = (req, res) => {
  const db = getDb();
  const { title, columns } = req.body;
  if (!db.boardConfig) db.boardConfig = getInitialData().boardConfig;
  
  if (title !== undefined) db.boardConfig.title = title.trim();
  if (Array.isArray(columns)) {
    columns.forEach(col => {
      const existing = db.boardConfig.columns.find(c => c.id === col.id);
      if (existing) {
        if (col.name !== undefined) {
          existing.name = col.name;
          existing.title = col.name;
        }
        if (col.title !== undefined) {
          existing.title = col.title;
          existing.name = col.title;
        }
        if (col.limit !== undefined) existing.limit = col.limit ? parseInt(col.limit, 10) : null;
      } else {
        db.boardConfig.columns.push({
          id: col.id,
          name: col.name || col.title || col.id,
          title: col.title || col.name || col.id,
          limit: col.limit !== undefined ? (col.limit ? parseInt(col.limit, 10) : null) : null
        });
      }
    });
  }

  saveData(db);
  res.status(200).json(db.boardConfig);
};
