const express = require('express');
const cookieParser = require('cookie-parser');
const paymentRoutes = require('./routes/payment.routes');
const cors=require('cors');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: [
    "https://supernova-shop-frontend.onrender.com",
    "https://shivamg.me",
    "https://www.shivamg.me"
  ],  credentials: true
}));


app.get('/', (req, res) => {
    res.status(200).json({
        message: "Payment service is running"
    });
})

app.use('/api/payments', paymentRoutes);

module.exports = app;