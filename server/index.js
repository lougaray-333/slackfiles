import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mappingsRouter from './routes/mappings.js';
import slackRouter from './routes/slack.js';
import boxRouter from './routes/box.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use('/slack/events', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/api/mappings', mappingsRouter);
app.use('/slack', slackRouter);
app.use('/api/box', boxRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Global error handler — prevents unhandled errors from crashing the process
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`ChannelBridge server listening on port ${PORT}`);
});
