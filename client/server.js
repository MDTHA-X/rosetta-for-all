// client/server.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 80;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api-config.js', (req, res) => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`window.ROSETTA_API_URL = "${apiUrl}";`);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Rosetta Client web server listening on port ${PORT}`);
});
