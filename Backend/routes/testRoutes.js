// /routes/testRoutes.js

const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

router.post('/save', testController.saveTest);
router.get('/stats', testController.getGlobalStats);
router.get('/user/:username', testController.getUserTests);
router.get('/get/:id', testController.getTest);

module.exports = router;
