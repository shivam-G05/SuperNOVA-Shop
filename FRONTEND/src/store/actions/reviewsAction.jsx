import axios from "axios";
const BASE_URL = "https://api.shivamg.me/api/products";

export const addReview=async(productId,rating,comment)=>{
    try{
        const response=await axios.post(`${BASE_URL}/${productId}/reviews`, { rating, comment }, { withCredentials: true },{headers:{'Content-Type':'application/json'}});
        return response.data;

    }catch(error){
        console.error("Error adding review",error);
        throw error;
    }
}
export const getReviews=async(productId)=>{
    try{
        const response=await axios.get(`${BASE_URL}/${productId}/reviews`);
        return response.data;
    }catch(error){
        console.error("Error fetching reviews",error);
        throw error;
    }
}
