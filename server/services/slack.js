import { WebClient } from '@slack/web-api';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function listChannels() {
  const all = [];
  let cursor;
  do {
    const result = await slack.conversations.list({
      types: 'public_channel,private_channel',
      exclude_archived: true,
      limit: 200,
      cursor,
    });
    all.push(...result.channels.map((c) => ({ id: c.id, name: c.name })));
    cursor = result.response_metadata?.next_cursor;
  } while (cursor);
  return { channels: all };
}

export async function getFileInfo(fileId) {
  const result = await slack.files.info({ file: fileId });
  return result.file;
}

export async function downloadFile(url) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Slack download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}
