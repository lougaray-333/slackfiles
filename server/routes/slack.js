import { Router } from 'express';
import slackVerify from '../middleware/slackVerify.js';
import getSupabase from '../services/supabase.js';
import { listChannels, getFileInfo, downloadFile } from '../services/slack.js';
import { uploadFile } from '../services/box.js';

const router = Router();

// Slack event subscription endpoint (uses raw body for signature verification)
router.post('/events', slackVerify, async (req, res) => {
  const { type, challenge, event } = req.body;

  if (type === 'url_verification') {
    return res.json({ challenge });
  }

  res.sendStatus(200);

  if (type === 'event_callback' && event?.type === 'file_shared') {
    try {
      await handleFileShared(event);
    } catch (err) {
      console.error('file_shared handler error:', err);
    }
  }
});

// API endpoint for frontend to list Slack channels
router.get('/channels', async (_req, res) => {
  try {
    const result = await listChannels();
    res.json(result.channels);
  } catch (err) {
    console.error('Slack channels error:', err);
    res.status(500).json({ error: err.message });
  }
});

async function handleFileShared(event) {
  const { channel_id, file_id } = event;

  const { data: mapping } = await getSupabase()
    .from('mappings')
    .select('*')
    .eq('slack_channel_id', channel_id)
    .eq('status', 'active')
    .single();

  if (!mapping) return;

  const cutoff = new Date(Date.now() - 60_000).toISOString();
  const { data: existing } = await getSupabase()
    .from('sync_logs')
    .select('id')
    .eq('mapping_id', mapping.id)
    .eq('file_id', file_id)
    .gte('created_at', cutoff)
    .limit(1);

  if (existing?.length) return;

  const file = await getFileInfo(file_id);
  const buffer = await downloadFile(file.url_private);
  const boxFile = await uploadFile(mapping.box_folder_id, file.name, buffer);

  await getSupabase().from('sync_logs').insert({
    mapping_id: mapping.id,
    file_id,
    file_name: file.name,
    box_file_id: boxFile.id,
    status: 'success',
  });
}

export default router;
