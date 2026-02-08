const mongoose=require('mongoose');

const reviewSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    }
},
{ timestamps: true }
);


const productSchema=new mongoose.Schema({
    category:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    price:{
        amount:{
            type:Number,
            required:true
        },
        currency:{
            type:String,
            enum:['USD','INR','EUR'],
            default:'INR'
        },

    },
    seller:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    images:
        [
            {
                url:String,
                thumbnail:String,
                id:String,
                

            }
        ],
    stock:{
        type: Number,
        default: 0
    },
    reviews:[reviewSchema]
},{timestamps:true});

productSchema.index({title:'text',description:'text'});

module.exports=mongoose.model('product',productSchema);