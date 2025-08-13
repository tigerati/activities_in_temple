// routes/mediaRoutes.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// ✅ your files live in temple-backend/uploads (not uploads/audio)
const AUDIO_DIR = path.join(__dirname, '..', 'uploads');

// whitelist extensions
const ALLOWED = new Set(['.mp3', '.m4a', '.wav', '.ogg']);

router.get('/audio', async (_req, res) => {
  try {
    const entries = await fs.readdir(AUDIO_DIR, { withFileTypes: true });

    const list = (await Promise.all(
      entries
        .filter(d => d.isFile())
        .map(async d => {
          const ext = path.extname(d.name).toLowerCase();
          if (!ALLOWED.has(ext)) return null;

          const filePath = path.join(AUDIO_DIR, d.name);
          const stat = await fs.stat(filePath);

          return {
            filename: d.name,
            url: `/uploads/${encodeURIComponent(d.name)}`,
            size: stat.size,
            modified_at: stat.mtime.toISOString(),
            ext
          };
        })
    )).filter(Boolean);

    list.sort((a, b) => new Date(b.modified_at) - new Date(a.modified_at));
    res.json(list);
  } catch (e) {
    console.error('List audio error:', e);
    res.status(500).json({ message: 'Cannot list audio' });
  }
});

module.exports = router;
