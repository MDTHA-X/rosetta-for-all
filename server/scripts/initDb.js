// server/scripts/initDb.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function runInit() {
  console.log('[InitDB] Starting database initialization...');
  await db.initDB();

  const driver = db.getDriver();
  console.log(`[InitDB] Target database driver: ${driver}`);

  const isMysql = driver === 'mysql';
  const autoInc = isMysql ? 'INT AUTO_INCREMENT' : 'INTEGER';
  const primaryKey = isMysql ? 'PRIMARY KEY' : 'PRIMARY KEY AUTOINCREMENT';
  const engine = isMysql ? 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci' : '';

  const tableStatements = [
    `CREATE TABLE IF NOT EXISTS settings (
      \`key\` VARCHAR(255) PRIMARY KEY,
      \`value\` TEXT NOT NULL
    ) ${engine}`,

    `CREATE TABLE IF NOT EXISTS admins (
      id ${autoInc} ${primaryKey},
      username VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      is_super ${isMysql ? 'TINYINT(1)' : 'INTEGER'} NOT NULL DEFAULT 0,
      created_at ${isMysql ? 'INT' : 'INTEGER'} NOT NULL
    ) ${engine}`,

    `CREATE TABLE IF NOT EXISTS tournaments (
      id ${autoInc} ${primaryKey},
      slug VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'intradept',
      time_control VARCHAR(50) NOT NULL DEFAULT '10+5',
      rounds_count ${isMysql ? 'INT' : 'INTEGER'} NOT NULL DEFAULT 7,
      default_rating ${isMysql ? 'INT' : 'INTEGER'} NOT NULL DEFAULT 1200,
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      admin_id ${isMysql ? 'INT' : 'INTEGER'} NULL,
      created_at ${isMysql ? 'INT' : 'INTEGER'} NOT NULL,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
    ) ${engine}`,

    `CREATE TABLE IF NOT EXISTS tournament_admins (
      id ${autoInc} ${primaryKey},
      tournament_id ${isMysql ? 'INT' : 'INTEGER'} NOT NULL,
      admin_id ${isMysql ? 'INT' : 'INTEGER'} NOT NULL,
      created_at ${isMysql ? 'INT' : 'INTEGER'} NOT NULL,
      UNIQUE(tournament_id, admin_id),
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    ) ${engine}`,

    `CREATE TABLE IF NOT EXISTS players (
      id ${autoInc} ${primaryKey},
      tournament_id ${isMysql ? 'INT' : 'INTEGER'} NOT NULL,
      name VARCHAR(255) NOT NULL,
      title VARCHAR(20) NOT NULL DEFAULT '',
      sex VARCHAR(10) NOT NULL DEFAULT '',
      batch VARCHAR(50) NOT NULL DEFAULT '',
      rating ${isMysql ? 'INT' : 'INTEGER'} NOT NULL,
      rating_type VARCHAR(50) NOT NULL DEFAULT 'manual',
      active ${isMysql ? 'TINYINT(1)' : 'INTEGER'} NOT NULL DEFAULT 1,
      UNIQUE(tournament_id, name),
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
    ) ${engine}`,

    `CREATE TABLE IF NOT EXISTS rounds (
      id ${autoInc} ${primaryKey},
      tournament_id ${isMysql ? 'INT' : 'INTEGER'} NOT NULL,
      number ${isMysql ? 'INT' : 'INTEGER'} NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'draft',
      UNIQUE(tournament_id, number),
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
    ) ${engine}`,

    `CREATE TABLE IF NOT EXISTS pairings (
      id ${autoInc} ${primaryKey},
      round_id ${isMysql ? 'INT' : 'INTEGER'} NOT NULL,
      board ${isMysql ? 'INT' : 'INTEGER'} NOT NULL,
      white_id ${isMysql ? 'INT' : 'INTEGER'} NULL,
      black_id ${isMysql ? 'INT' : 'INTEGER'} NULL,
      result VARCHAR(10) NULL,
      is_bye ${isMysql ? 'TINYINT(1)' : 'INTEGER'} NOT NULL DEFAULT 0,
      bye_for_id ${isMysql ? 'INT' : 'INTEGER'} NULL,
      UNIQUE(round_id, board),
      FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE,
      FOREIGN KEY (white_id) REFERENCES players(id) ON DELETE SET NULL,
      FOREIGN KEY (black_id) REFERENCES players(id) ON DELETE SET NULL,
      FOREIGN KEY (bye_for_id) REFERENCES players(id) ON DELETE SET NULL
    ) ${engine}`,

    `CREATE TABLE IF NOT EXISTS login_limits (
      ip VARCHAR(45) PRIMARY KEY,
      failures ${isMysql ? 'INT' : 'INTEGER'} NOT NULL DEFAULT 0,
      first_failure ${isMysql ? 'INT' : 'INTEGER'} NOT NULL,
      locked_until ${isMysql ? 'INT' : 'INTEGER'} NOT NULL DEFAULT 0
    ) ${engine}`,
  ];

  for (const statement of tableStatements) {
    await db.query(statement);
  }
  console.log('[InitDB] Tables created or verified.');

  // Seed default admin accounts
  const mdthaHash = await bcrypt.hash('mdtha', 10);
  const adminHash = await bcrypt.hash('admin', 10);
  const now = Math.floor(Date.now() / 1000);

  const existingMdtha = await db.fetch('SELECT id FROM admins WHERE username = ?', ['mdtha']);
  if (!existingMdtha) {
    await db.query(
      'INSERT INTO admins (username, password_hash, is_super, created_at) VALUES (?, ?, 1, ?)',
      ['mdtha', mdthaHash, now]
    );
    console.log('[InitDB] Seeded super admin account: "mdtha"');
  }

  const existingAdmin = await db.fetch('SELECT id FROM admins WHERE username = ?', ['admin']);
  if (!existingAdmin) {
    await db.query(
      'INSERT INTO admins (username, password_hash, is_super, created_at) VALUES (?, ?, 1, ?)',
      ['admin', adminHash, now]
    );
    console.log('[InitDB] Seeded admin account: "admin"');
  }

  // Create sample tournament if none exists
  const count = await db.fetch('SELECT COUNT(*) as cnt FROM tournaments');
  if (count && count.cnt === 0) {
    const admin = await db.fetch('SELECT id FROM admins WHERE username = ?', ['mdtha']);
    const tResult = await db.query(
      `INSERT INTO tournaments (slug, name, type, time_control, rounds_count, default_rating, status, admin_id, created_at) 
       VALUES ('rosetta-open', 'Rosetta Open Championship', 'standard', '15+10', 5, 1200, 'active', ?, ?)`,
      [admin?.id || null, now]
    );
    const tournamentId = tResult.insertId || 1;

    // Seed 4 sample players
    const players = [
      { name: 'Magnus Carlsen', rating: 2830, title: 'GM' },
      { name: 'Hikaru Nakamura', rating: 2802, title: 'GM' },
      { name: 'Alireza Firouzja', rating: 2795, title: 'GM' },
      { name: 'Gukesh D', rating: 2783, title: 'GM' },
    ];

    for (const p of players) {
      await db.query(
        'INSERT INTO players (tournament_id, name, title, sex, batch, rating, rating_type, active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
        [tournamentId, p.name, p.title, 'M', '2026', p.rating, 'manual']
      );
    }
    console.log('[InitDB] Seeded sample tournament "Rosetta Open Championship" with 4 players.');
  }

  console.log('[InitDB] Initialization complete!');
}

if (require.main === module) {
  runInit()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[InitDB] Error:', err);
      process.exit(1);
    });
}

module.exports = runInit;
