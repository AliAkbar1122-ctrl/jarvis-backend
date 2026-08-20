require('dotenv').config();

const express = require('express');
const { google } = require('googleapis');
const path = require('path');

const app = express();
app.use(express.json());

// 1. Health check route - Railway isi se check karega
app.get('/', (req, res) => {
  res.send('Jarves AI is Running! Connected with Gmail');
});

// 2. Test route for Gmail
app.get('/test-gmail', (req, res) => {
  console.log("Testing Gmail connection...");
  res.send('Gmail route working');
});

// 3. Gmail OAuth setup
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Yahan tumhara baaki Gmail code aayega baad me

// IMPORTANT: Railway ke liye ye 2 cheez lazmi hain
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Jarves running on port ${PORT}`);
});
