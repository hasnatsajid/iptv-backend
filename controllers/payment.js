const MD5 = require('crypto-js/md5');
const axios = require('axios');

const makePayment = async (req, res) => {
  const paymentData = req.body;

  console.log(paymentData);

  var data = {
    order_id: '123123',
    currency: 'USDT',
    amount: '10',
    // is_payment_multiple: false,
    // url_callback: 'https://iptv-backend.hassuu.com/payment/webhook',
    // url_return: 'https://iptv.hassuu.com/auth',
  };

  const mysign = MD5(
    btoa(JSON.stringify(paymentData)) +
      '4KgkyCwCTItsIXmEnX1BPyaYuqv2oTD6CXSwwmKypxwQT5aUA8jhurpKBt9xyspKPxr41nGOzZ3m6AGZgVhQTLIjMCNWREkI3oijRTkG8XD25caMc2YXHKq4xJhewzE7'
  ).toString();

  // console.log('MD5 : ', mysign);

  try {
    const response = await axios({
      baseURL: 'https://api.cryptomus.com/v1/payment',
      method: 'post',
      headers: {
        merchant: '88678e43-8060-427f-926c-d337853ee43e',
        // sign: 'bd68fae0966437483880809dfef68b83',
        sign: mysign,
        'Content-Type': 'application/json',
        // 'Access-Control-Allow-Origin': '*',
      },
      data: paymentData,
    });

    res.json({ data: response.data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

const paymentWebhook = async (req, res) => {
  const { sign, status, is_final } = req.body;

  if (is_final === true && status === 'paid') {
  }
};

module.exports = { makePayment };
