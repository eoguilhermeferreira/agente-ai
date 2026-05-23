const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getInstance,
  createInstance,
  getQrCode,
  disconnectInstance,
  getStatus,
} = require('../controllers/whatsappController');

router.use(auth);
router.get('/instance', getInstance);
router.post('/instance', createInstance);
router.get('/qrcode', getQrCode);
router.delete('/instance', disconnectInstance);
router.get('/status', getStatus);

module.exports = router;
