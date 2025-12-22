import axios from 'axios';

export const asyncgetusers=async()=>{
    try{
        const res=await axios.get('https://supernova-shop.onrender.com/api/auth/me',{
            withCredentials:true
        });
        
        return res.data.user;
        
    }catch(err){
        console.log(err);
    }
}
export const asynclogout = async () => {
    try {
        const res = await axios.post('https://supernova-shop.onrender.com/api/auth/logout', {}, {
            withCredentials: true
        });
        // console.log('Logout successful:', res.data.message);
        return res.data;
    } catch (err) {
        console.error('Logout error:', err);
        throw err;
    }
}