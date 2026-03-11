import { Router } from 'express';
import { listFolders } from '../services/box.js';

const router = Router();

// Get folder children (for tree browser)
router.get('/folders', async (req, res) => {
  try {
    const folderId = req.query.parent || '0';
    const folders = await listFolders(folderId);
    res.json(folders);
  } catch (err) {
    console.error('Box folders error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
