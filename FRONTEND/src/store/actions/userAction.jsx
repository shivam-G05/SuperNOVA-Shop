import axios from 'axios';

export const asyncgetusers=async()=>{
    try{
        const res=await axios.get(`http://3.238.239.123:3000/api/auth/me`,{
            withCredentials:true
        });
        
        return res.data.user;
        
    }catch(err){
        // console.log(err);
    }
}
export const asynclogout = async () => {
    try {
        const res = await axios.post(`http://3.238.239.123:3000/api/auth/logout`, {}, {
            withCredentials: true
        });
        // console.log('Logout successful:', res.data.message);
        return res.data;
    } catch (err) {
        console.error('Logout error:', err);
        throw err;
    }
}