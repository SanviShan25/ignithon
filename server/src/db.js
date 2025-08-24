import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../data.db');
const db = new Database(dbPath);

// Load schema.sql and create tables
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// Helper functions
export const q = (sql, params=[]) => db.prepare(sql).all(params);
export const run = (sql, params=[]) => db.prepare(sql).run(params);
export const get = (sql, params=[]) => db.prepare(sql).get(params);

export default db;