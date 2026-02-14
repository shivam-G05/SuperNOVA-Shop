require('dotenv').config();
const express=require('express');
const cookieParser=require('cookie-parser')
const sellerRoutes=require('./routes/seller.routes')
const app=express();
const cors=require('cors');
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Seller Dashboard Service is running.' });
});

app.use(cors({
  origin: [
    "https://supernova-shop-frontend.onrender.com",
    "https://shivamg.me",
    "https://www.shivamg.me",
    "https://api.shivamg.me"
  ],  credentials: true
}));
app.use('/api/seller/dashboard',sellerRoutes)


module.exports=app;