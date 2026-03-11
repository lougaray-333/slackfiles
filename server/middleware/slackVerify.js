import crypto from 'crypto';

export default function slackVerify(req, res, next) {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) return res.status(500).send('Missing signing secret');

  const timestamp = req.headers['x-slack-request-timestamp'];
  const slackSig = req.headers['x-slack-signature'];

  if (!timestamp || !slackSig) return res.status(400).send('Missing Slack headers');

  // Reject requests older than 5 minutes
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    return res.status(400).send('Request too old');
  }

  const body = req.body; // raw Buffer from express.raw()
  const baseString = `v0:${timestamp}:${body}`;
  const hmac = crypto.createHmac('sha256', signingSecret).update(baseString).digest('hex');
  const computedSig = `v0=${hmac}`;

  if (!crypto.timingSafeEqual(Buffer.from(computedSig), Buffer.from(slackSig))) {
    return res.status(401).send('Invalid signature');
  }

  // Parse the raw body as JSON for downstream handlers
  req.body = JSON.parse(body.toString());
  next();
}
