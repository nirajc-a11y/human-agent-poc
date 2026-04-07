require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/agents'));
app.use('/', require('./routes/calls'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Plivo browser calling server running on http://localhost:${PORT}`);
});
