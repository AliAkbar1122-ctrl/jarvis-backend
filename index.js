const express = require('express');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/api/healthz', (req, res) => {
  res.json({ status: 'ok', jarvis: 'online' });
});

app.post('/api/chat', (req, res) => {
  const message = (req.body.message || '').trim();

  if (!message) {
    return res.status(400).json({
      error: 'Message is required'
    });
  }

  let reply;

  if (message.toLowerCase().includes('hello')) {
    reply = 'Hello! I am Jarvis. How can I help you?';
  } else if (message.toLowerCase().includes('name')) {
    reply = 'I am Jarvis, your personal assistant.';
  } else {
    reply = `I received your message: ${message}`;
  }

  res.json({ reply });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Jarvis running on port ${PORT}`);
});
