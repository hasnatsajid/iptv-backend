const { Schema, model } = require('mongoose');

const orderSchema = new Schema({
  email: String,
  order_id: String,
  amount: String,
  payment_amount: String,
  currency: String,
  payer_currency: String,
  payment_status: String,
  status: String,
  network: String,
  address: String,
  is_final: String,
  url: String,
  plan: {
    type: String,
    enum: ['monthly', 'tri-monthly', 'hexa-monthly', 'yearly'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiry: {
    type: Date,
  },
});

module.exports = model('Order', orderSchema);
