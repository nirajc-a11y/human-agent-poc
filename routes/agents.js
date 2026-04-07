const express = require('express');
const router = express.Router();

router.get('/agents', (req, res) => res.json([]));

module.exports = router;
