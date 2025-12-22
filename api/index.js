const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('ROOT OK');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API TEST OK' });
});

module.exports = app;
