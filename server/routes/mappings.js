import { Router } from 'express';
import supabase from '../services/supabase.js';

const router = Router();

// List all mappings
router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('mappings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Create mapping
router.post('/', async (req, res) => {
  const { project_name, tags, slack_channel_id, slack_channel_name, box_folder_id, box_folder_name } = req.body;

  const { data, error } = await supabase
    .from('mappings')
    .insert({
      project_name,
      tags: tags || [],
      slack_channel_id,
      slack_channel_name,
      box_folder_id,
      box_folder_name,
      status: 'active',
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// Update mapping
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const { data, error } = await supabase
    .from('mappings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Delete mapping
router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('mappings').delete().eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.sendStatus(204);
});

// Get logs for a mapping
router.get('/:id/logs', async (req, res) => {
  const { data, error } = await supabase
    .from('sync_logs')
    .select('*')
    .eq('mapping_id', req.params.id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
