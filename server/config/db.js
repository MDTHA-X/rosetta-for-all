const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_DRIVER = process.env.DB_DRIVER || (process.env.NODE_ENV === 'test' ? 'sqlite' : 'mysql');
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'rosetta_for_all';

let mysqlPool = null;
let sqliteDb = null;
let activeDriver = 'sqlite';

async function initDB() {
  if (DB_DRIVER === 'mysql') {
    try {
      // First ensure database exists
      const tempConn = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASS,
      });
      await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await tempConn.end();

      mysqlPool = mysql.createPool({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
      activeDriver = 'mysql';
      console.log(`[DB] Connected to MySQL database "${DB_NAME}" on ${DB_HOST}:${DB_PORT}`);
      return;
    } catch (err) {
      console.warn(`[DB] MySQL connection failed (${err.message}). Falling back to SQLite for local execution.`);
    }
  }

  // SQLite fallback
  const sqliteFile = path.resolve(__dirname, '../database.sqlite');
  sqliteDb = new sqlite3.Database(sqliteFile);
  activeDriver = 'sqlite';
  await runSqlite('PRAGMA foreign_keys = ON;');
  console.log(`[DB] Using SQLite database at "${sqliteFile}"`);
}

function runSqlite(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ insertId: this.lastID, affectedRows: this.changes });
    });
  });
}

function allSqlite(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function getSqlite(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

async function query(sql, params = []) {
  if (activeDriver === 'mysql') {
    // Adapt syntax
    let adaptedSql = sql.replace(/INSERT OR IGNORE INTO/gi, 'INSERT IGNORE INTO');
    const [result] = await mysqlPool.execute(adaptedSql, params);
    return result;
  } else {
    let adaptedSql = sql.replace(/INSERT IGNORE INTO/gi, 'INSERT OR IGNORE INTO');
    // If it's a SELECT statement
    const trimmed = adaptedSql.trim().toUpperCase();
    if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA')) {
      return await allSqlite(adaptedSql, params);
    }
    return await runSqlite(adaptedSql, params);
  }
}

async function fetch(sql, params = []) {
  if (activeDriver === 'mysql') {
    let adaptedSql = sql.replace(/INSERT OR IGNORE INTO/gi, 'INSERT IGNORE INTO');
    const [rows] = await mysqlPool.execute(adaptedSql, params);
    return rows[0] || null;
  } else {
    let adaptedSql = sql.replace(/INSERT IGNORE INTO/gi, 'INSERT OR IGNORE INTO');
    return await getSqlite(adaptedSql, params);
  }
}

async function fetchAll(sql, params = []) {
  if (activeDriver === 'mysql') {
    let adaptedSql = sql.replace(/INSERT OR IGNORE INTO/gi, 'INSERT IGNORE INTO');
    const [rows] = await mysqlPool.execute(adaptedSql, params);
    return rows;
  } else {
    let adaptedSql = sql.replace(/INSERT IGNORE INTO/gi, 'INSERT OR IGNORE INTO');
    return await allSqlite(adaptedSql, params);
  }
}

function getDriver() {
  return activeDriver;
}

module.exports = {
  initDB,
  query,
  fetch,
  fetchAll,
  getDriver,
};
