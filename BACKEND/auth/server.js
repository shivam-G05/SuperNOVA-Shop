require('dotenv').config();
const app=require('./src/app');
const {connect}=require('./src/broker/broker');
connect()

const connectDB=require('./src/db/db');
connectDB();

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});

app.listen(3000,()=>{
    console.log("SERVER IS RUNNING ON PORT 3000");
});