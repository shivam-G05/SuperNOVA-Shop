require('dotenv').config();
const express=require('express');
const cookieParser=require('cookie-parser');
const cors=require('cors');
const productRoutes=require('./routes/product.route');



const app=express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    "https://supernova-shop-frontend.onrender.com",
    "https://shivamg.me",
    "https://www.shivamg.me"
  ],  credentials: true
}));


app.get('/', (req, res) => {
    res.status(200).json({ message: 'Product Service is running.' });
});


app.use('/api/products',productRoutes);

module.exports=app;