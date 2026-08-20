require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');

const app = express();
app.use(express.json());
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI

  
