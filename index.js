const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();
const userRoutes = require('./routes/user.js');
const paymentRoutes = require('./routes/payment.js');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;

app.use(express.json());
app.use(cors());

app.use('/user', userRoutes);
app.use('/payment', paymentRoutes);

app.listen(PORT, async () => {
  try {
    mongoose.connect(`${MONGO_URI}`, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log(`Server started on ${PORT}...`);
  } catch (err) {
    console.log(`Server failed starting ${err}...`);
  }
});
