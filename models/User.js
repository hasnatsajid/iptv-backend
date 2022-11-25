const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  orders: [
    {
      order_id: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  payment_status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive',
  },
  order_expiry: Date,
});

module.exports = model('User', userSchema);
