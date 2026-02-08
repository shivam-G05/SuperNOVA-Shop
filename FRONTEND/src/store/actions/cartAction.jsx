import axios from 'axios';

export const asyncaddtocart=async(product_id,product_qty)=>{
    try{
        const res=await axios.post(`http://localhost:3002/api/cart/items`,{
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
        const res=await axios.get(`http://localhost:3002/api/cart`,{
            withCredentials:true
        });
        return(res.data.cart.items);
    }catch(err){
        console.log(err);
    }
};

export const asyncupdatecartitems=async(product_id,product_quantity)=>{
    try{
        const res=await axios.patch( `http://localhost:3002/api/cart/items/${product_id}`,{
            qty:product_quantity
        },{
            withCredentials:true
        })
        console.log(res);

    }catch(err){
        console.log(err)
    }
}

export const asyncdeletecartitem=async(product_id)=>{
    try{
        const res=await axios.delete(`http://localhost:3002/api/cart/items/${product_id}`,{
            withCredentials:true

        });
        console.log(res);
        return res.data;
    }catch(err){
        console.log(err);
        throw err;
    }
}