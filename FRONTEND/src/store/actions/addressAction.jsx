import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/auth';;


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
            `http://localhost:3000/api/auth/users/me/addresses`, 
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