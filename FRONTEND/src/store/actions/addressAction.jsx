import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/auth/api/auth`;


export const asyncgetaddresses = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/users/me/addresses`, {
            withCredentials: true
        });
        console.log('Addresses fetched:', res.data.addresses);
        return res.data.addresses;
    } catch (err) {
        console.error('Error fetching addresses:', err);
        throw err;
    }
};


export const asyncaddaddress = async (addressData) => {
    try {
        const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/api/auth/users/me/addresses`, 
            addressData,  
            {
                withCredentials: true
            }
        );
        
        return res.data.address;
    } catch (err) {
        console.log('Error adding address:', err);
        throw err;
    }
};


export const asyncdeleteaddress = async (addressId) => {
    try {
        const res = await axios.delete(`${BASE_URL}/users/me/addresses/${addressId}`, {
            withCredentials: true
        });
        console.log('Address deleted:', res.data);
        return res.data.addresses;
    } catch (err) {
        console.error('Error deleting address:', err);
        throw err;
    }
};