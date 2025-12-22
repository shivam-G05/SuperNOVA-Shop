require('dotenv').config();
const app=require('./src/app');
const connectDB=require('./src/db/db');

connectDB();

app.listen(process.env.PORT || 3002,()=>{
    console.log("cart service running on 3002 port");
})