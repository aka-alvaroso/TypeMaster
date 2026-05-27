const express = require('express');
const router = express.Router();
const { getUserMatches } = require('../controllers/matchController');

router.get('/user/:username', getUserMatches);

module.exports = router;
