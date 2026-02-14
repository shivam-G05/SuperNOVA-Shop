const express = require('express');
const cookieParser = require('cookie-parser');

const cors =require('cors')


const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: [
    "https://supernova-shop-frontend.onrender.com",
    "https://shivamg.me",
    "https://www.shivamg.me",
    "https://api.shivamg.me"

  ],
  
  credentials: true
}));

app.get('/', (req, res) => {
    res.status(200).json({
        message: "Auth service is running"
    });
})

// Routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);


module.exports = app;