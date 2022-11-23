const MD5 = require('crypto-js/md5');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Order = require('../models/Order');
const User = require('../models/User');

const makePayment = async (req, res) => {
  let { email, ...paymentData } = req.body;

  let { currentId } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../models/orders.json')));

  if (currentId) {
    paymentData = { ...paymentData, order_id: currentId };
  }

  let newOrderId = parseInt(currentId);
  newOrderId++;

  fs.writeFileSync(path.resolve(__dirname, '../models/orders.json'), JSON.stringify({ currentId: `${newOrderId}` }));

  // var data = {
  //   order_id: '123123',
  //   currency: 'USDT',
  //   amount: '10',
  //   // is_payment_multiple: false,
  //   // url_callback: 'https://iptv-backend.hassuu.com/payment/webhook',
  //   // url_return: 'https://iptv.hassuu.com/auth',
  // };

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

    const newOrder = { ...response.data.result, email };
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
  const { order_id, is_final, status } = paymentBody;

  const mysign = MD5(
    btoa(JSON.stringify(paymentBody)) +
      '4KgkyCwCTItsIXmEnX1BPyaYuqv2oTD6CXSwwmKypxwQT5aUA8jhurpKBt9xyspKPxr41nGOzZ3m6AGZgVhQTLIjMCNWREkI3oijRTkG8XD25caMc2YXHKq4xJhewzE7'
  ).toString();

  const myOrder = await Order.findOne({ order_id });
  const { email } = myOrder;

  try {
    if (sign === mysign) {
      if (is_final === true && (status === 'paid' || status === 'paid_over')) {
        const user = await User.findOne({ email });
        user.orders.push({ order_id });
        user.payment_status = 'active';
        await user.save();

        return res.json({ message: 'User paid' });
      }
    }
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong in your webhook' });
  }
};

module.exports = { makePayment, paymentWebhook };
