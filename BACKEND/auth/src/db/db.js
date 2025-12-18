const mongoose=require('mongoose');
async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("DB CONNECTED");

    }catch(error){
        console.log("ERROR CONNECTION DATABASE",error);
    }
}
module.exports=connectDB;