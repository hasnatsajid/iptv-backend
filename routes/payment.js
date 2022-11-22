const express = require('express');

const router = express.Router();

const { makePayment } = require('../controllers/payment.js');

router.post('/', makePayment);
// router.post('/webhook', makePayment);

module.exports = router;
