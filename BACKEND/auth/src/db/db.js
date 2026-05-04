const mongoose=require('mongoose');
async function connectDB(){
    try{
        const uri = process.env.MONGO_URI || process.env.MONGO_URL;
        if(!uri) throw new Error('MONGO_URI or MONGO_URL not set');
        await mongoose.connect(uri);
        console.log("DB CONNECTED");

    }catch(error){
        console.log("ERROR CONNECTION DATABASE",error);
    }
}
module.exports=connectDB;