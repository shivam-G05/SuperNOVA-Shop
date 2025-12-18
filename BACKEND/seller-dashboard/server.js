require('dotenv').config();
const app=require('./src/app')
const connectDB=require('./src/db/db');
const {connect}=require('./src/broker/broker');
const listener=require('./src/broker/listener');
connectDB()

connect().then(()=>{
    listener()



})

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED PROMISE REJECTION:", reason);
});

app.listen(3007,()=>{
    console.log("Seller-dashboard service is running on port 3007")
})