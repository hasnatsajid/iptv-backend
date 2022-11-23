const express = require('express');

const router = express.Router();

const { makePayment, paymentWebhook } = require('../controllers/payment.js');

router.post('/', makePayment);
router.post('/webhook', paymentWebhook);

module.exports = router;
