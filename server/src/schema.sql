PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT CHECK(role IN ('donor','ngo','consumer','volunteer')) NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  pincode TEXT,
  prefs TEXT,       -- JSON (dietary needs)
  allergies TEXT    -- JSON
);

CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  donor_id INTEGER,
  title TEXT NOT NULL,
  food_type TEXT,
  portions INTEGER NOT NULL,
  pincode TEXT NOT NULL,
  lat REAL, lng REAL,
  allergens TEXT,         -- JSON
  tags TEXT,              -- JSON e.g. ["veg","protein"]
  photo_url TEXT,
  hygiene_ack INTEGER DEFAULT 0,
  ready_until TEXT NOT NULL,   -- ISO datetime
  expires_at  TEXT NOT NULL,   -- ISO datetime (same as ready_until for now)
  created_at  TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(donor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  user_id INTEGER,
  status TEXT CHECK(status IN ('requested','approved','picked')) DEFAULT 'requested',
  otp TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);