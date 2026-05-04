const express=require('express');
const cartRoutes=require('./routes/cart.routes');
const cookieParser = require('cookie-parser');
const cors=require('cors');
const app=express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "https://supernova-4suf.onrender.com"
  ,  credentials: true
}));

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Cart Service is running.' });
});


app.use('/api/cart',cartRoutes);
module.exports=app;
