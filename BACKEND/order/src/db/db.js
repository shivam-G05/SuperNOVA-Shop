const mongoose=require('mongoose');

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MONGODB CONNECTED ");

    }catch(err){
        console.log("ERROR CONNECTING DB")
    }
};

module.exports=connectDB;