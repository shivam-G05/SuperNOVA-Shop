const express=require('express');
const cookieParser=require('cookie-parser');
const orderRoutes = require("./routes/order.routes")
const cors=require('cors')
const app=express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.get('/', (req, res) => {
    res.status(200).json({
        message: "Order service is running"
    });
});

app.use("/api/orders", orderRoutes);
module.exports = app;