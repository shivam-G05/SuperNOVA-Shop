import axios from 'axios';

export const asyncaddtocart=async(product_id,product_qty)=>{
    try{
        const res=await axios.post('https://cart-1or0.onrender.com/api/cart/items',{
            productId:product_id,
            qty:product_qty,
            
        },{
            withCredentials:true
        });
        console.log(res);
    }catch(err){
        console.log(err);
    }
};
export const asyncgetcartitems=async()=>{
    try{
        const res=await axios.get('https://cart-1or0.onrender.com/api/cart',{
            withCredentials:true
        });
        return(res.data.cart.items);
    }catch(err){
        console.log(err);
    }
};

export const asyncupdatecartitems=async(product_id,product_quantity)=>{
    try{
        const res=await axios.patch(`https://cart-1or0.onrender.com/api/cart/items/${product_id}`,{
            qty:product_quantity
        },{
            withCredentials:true
        })
        console.log(res);

    }catch(err){
        console.log(err)
    }
}