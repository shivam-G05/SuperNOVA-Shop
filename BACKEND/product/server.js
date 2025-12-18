require('dotenv').config();
const app=require('./src/app');
const connectDB=require('./src/db/db');
const {connect}=require('./src/broker/broker')
connect();

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED PROMISE REJECTION:", reason);
});


connectDB();
app.listen(3001,()=>{
    console.log('Product Service is running on port 3001');
});