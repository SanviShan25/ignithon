import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { q, run, get } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

// --- Health check
app.get('/api/health', (_, res) => res.json({ ok: true }));

// --- Get listings (for NGOs/consumers)
app.get('/api/listings', (req, res) => {
  const { pincode } = req.query;
  let sql = `SELECT * FROM listings WHERE datetime(expires_at) > datetime('now')`;
  const params = [];
  if (pincode) { sql += ` AND pincode=?`; params.push(pincode); }

  const rows = q(sql, params).map(r => ({
    ...r,
    allergens: JSON.parse(r.allergens || '[]'),
    tags: JSON.parse(r.tags || '[]'),
  }));
  res.json(rows);
});

// --- Add listing (for donors)
app.post('/api/listings', (req, res) => {
  const d = req.body;
  const expires_at = d.ready_until;

  const info = run(
    `INSERT INTO listings (title,food_type,portions,pincode,lat,lng,allergens,tags,photo_url,hygiene_ack,ready_until,expires_at)
     VALUES (@title,@food_type,@portions,@pincode,@lat,@lng,@allergens,@tags,@photo_url,@hygiene_ack,@ready_until,@expires_at)`,
    {
      ...d,
      allergens: JSON.stringify(d.allergens||[]),
      tags: JSON.stringify(d.tags||[]),
      hygiene_ack: d.hygiene_ack?1:0,
      expires_at
    }
  );
  const row = get(`SELECT * FROM listings WHERE id=?`, [info.lastInsertRowid]);
  res.json(row);
});

// --- Claim listing
app.post('/api/claims', (req, res) => {
  const { listing_id } = req.body;
  if (!listing_id) return res.status(400).json({ error: 'listing_id required' });

  const otp = String(Math.floor(1000 + Math.random()*9000));
  const info = run(
    `INSERT INTO claims (listing_id, status, otp) VALUES (?, 'requested', ?)`,
    [listing_id, otp]
  );
  res.json({ claim_id: info.lastInsertRowid, otp });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));