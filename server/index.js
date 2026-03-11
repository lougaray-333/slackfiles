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

app.listen(PORT, () => {
  console.log(`ChannelBridge server listening on port ${PORT}`);
});
