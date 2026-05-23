const express = require('express');
const router = express.Router();
const { handleEvolutionWebhook } = require('../controllers/webhookController');

router.post('/evolution', handleEvolutionWebhook);

module.exports = router;
