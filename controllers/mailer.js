const nodemailer = require('nodemailer');

const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: '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',
    },
  })
);

const sendEmail = (req, res, next) => {
  const { name, subject, email, message } = req.body;

  transporter
    .sendMail({
      to: 'kobi.iptv@gmail.com',
      from: 'kobi.iptv@gmail.com',
      subject,
      html: `${email} says that: ${message}`,
    })
    .then((result) => {
      return res.status(200).json({ status: true, message: 'Message sent successfully :)' });
    })
    .catch((e) => {
      console.log(e);
      return res.status(500).json({ status: false, message: 'Message sending failed ;(' });
    });
};

module.exports = sendEmail;
