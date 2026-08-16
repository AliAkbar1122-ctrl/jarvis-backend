require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');

const app = express();
app.use(express.json());

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

let savedTokens = null;

app.get('/api/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'],
  });
  res.redirect(url);
});

app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  savedTokens = tokens;
  oauth2Client.setCredentials(tokens);
  res.send('Gmail connected successfully! You can close this tab.');
});

app.get('/api/gmail/messages', async (req, res) => {
  if (!savedTokens) return res.status(401).json({ error: 'Not authenticated' });
  oauth2Client.setCredentials(savedTokens);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const result = await gmail.users.messages.list({ userId: 'me', maxResults: 10 });
  res.json(result.data);
});
app.get('/api/gmail/summary', async (req, res) => {
  if (!savedTokens) return res.status(401).json({ error: 'Not authenticated' });
  oauth2Client.setCredentials(savedTokens);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const list = await gmail.users.messages.list({ userId: 'me', maxResults: 5 });
  const messages = list.data.messages || [];
  const details = await Promise.all(messages.map(async (m) => {
    const msg = await gmail.users.messages.get({ userId: 'me', id: m.id, format: 'metadata', metadataHeaders: ['Subject', 'From'] });
    const headers = msg.data.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || '(no subject)';
    const from = headers.find(h => h.name === 'From')?.value || '';
    return { subject, from, snippet: msg.data.snippet };
  }));
  res.json({ emails: details });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
