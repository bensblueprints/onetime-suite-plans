'use strict';
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function open(dbPath) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      key TEXT UNIQUE NOT NULL,
      rate_per_min INTEGER DEFAULT 30,
      daily_quota INTEGER DEFAULT 0,
      renders_total INTEGER DEFAULT 0,
      renders_today INTEGER DEFAULT 0,
      today_date TEXT DEFAULT '',
      revoked INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS renders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      mode TEXT, preset TEXT,
      width INTEGER, height INTEGER, fps INTEGER, duration_s REAL,
      format TEXT, params_json TEXT,
      file_path TEXT, poster_path TEXT,
      size_bytes INTEGER DEFAULT 0, frames INTEGER DEFAULT 0,
      status TEXT DEFAULT 'queued', error TEXT, progress REAL DEFAULT 0,
      api_key_id INTEGER, took_ms INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS usage_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      api_key_id INTEGER, status_code INTEGER, took_ms INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
    CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, token TEXT UNIQUE, created_at TEXT DEFAULT (datetime('now')));
  `);
  return db;
}

function genKey() { return 'uv_' + crypto.randomBytes(16).toString('hex'); }
function genToken() { return crypto.randomBytes(24).toString('hex'); }

module.exports = { open, genKey, genToken };
