require('dotenv').config(););

// baaki aapka existing Gmail code yahan rahega

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
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

  );

// baaki aapka existing Gmail code yahan rahega

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
