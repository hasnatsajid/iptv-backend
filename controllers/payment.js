const MD5 = require('crypto-js/md5');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Order = require('../models/Order');
const User = require('../models/User');

const makePayment = async (req, res) => {
  let { email, plan, ...paymentData } = req.body;
  console.log(req.body);

  let { currentId } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../models/orders.json')));

  if (currentId) {
    paymentData = { ...paymentData, order_id: currentId, additional_data: plan };
  }

  let newOrderId = parseInt(currentId);
  newOrderId++;

  fs.writeFileSync(path.resolve(__dirname, '../models/orders.json'), JSON.stringify({ currentId: `${newOrderId}` }));

  const mysign = MD5(
    btoa(JSON.stringify(paymentData)) +
      '4KgkyCwCTItsIXmEnX1BPyaYuqv2oTD6CXSwwmKypxwQT5aUA8jhurpKBt9xyspKPxr41nGOzZ3m6AGZgVhQTLIjMCNWREkI3oijRTkG8XD25caMc2YXHKq4xJhewzE7'
  ).toString();

  try {
    const response = await axios({
      baseURL: 'https://api.cryptomus.com/v1/payment',
      method: 'post',
      headers: {
        merchant: '88678e43-8060-427f-926c-d337853ee43e',
        sign: mysign,
        'Content-Type': 'application/json',
      },
      data: paymentData,
    });

    let numOfMonths;
    let newDate = new Date();
    switch (plan) {
      case 'monthly':
        numOfMonths = 1;
        break;
      case 'tri-monthly':
        numOfMonths = 3;
        break;
      case 'hexa-monthly':
        numOfMonths = 6;
        break;
      case 'yearly':
        numOfMonths = 12;
        break;

      default:
        numOfMonths = 0;
        break;
    }

    newDate.setMonth(newDate.getMonth() + numOfMonths);

    const newOrder = { ...response.data.result, email, plan, expiry: newDate.toISOString() };
    const OrderModel = new Order(newOrder);
    OrderModel.save();

    res.json({ data: response.data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

const paymentWebhook = async (req, res) => {
  const { sign, ...paymentBody } = req.body;
  const { order_id, is_final, status, additional_data } = paymentBody;

  const mysign = MD5(
    btoa(JSON.stringify(paymentBody)) +
      '4KgkyCwCTItsIXmEnX1BPyaYuqv2oTD6CXSwwmKypxwQT5aUA8jhurpKBt9xyspKPxr41nGOzZ3m6AGZgVhQTLIjMCNWREkI3oijRTkG8XD25caMc2YXHKq4xJhewzE7'
  ).toString();

  const myOrder = await Order.findOne({ order_id });
  const { email } = myOrder;

  try {
    if (sign === mysign) {
      if (is_final === true && (status === 'paid' || status === 'paid_over')) {
        let expiryDate = new Date();

        switch (additional_data) {
          case 'monthly':
            expiryDate.setMonth(expiryDate.getMonth() + 1);
            break;
          case 'tri-monthly':
            expiryDate.setMonth(expiryDate.getMonth() + 3);
            break;
          case 'hexa-monthly':
            expiryDate.setMonth(expiryDate.getMonth() + 6);
            break;
          case 'yearly':
            expiryDate.setMonth(expiryDate.getMonth() + 12);
            break;

          default:
            numOfMonths = 0;
            break;
        }

        const user = await User.findOne({ email });
        user.orders.push({ order_id });
        user.payment_status = 'active';
        user.order_expiry = expiryDate;
        await user.save();

        return res.json({ message: 'User paid' });
      }
    }
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong in your webhook' });
  }
};

module.exports = { makePayment, paymentWebhook };
