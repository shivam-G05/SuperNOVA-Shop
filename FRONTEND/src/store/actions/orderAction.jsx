// import axios from 'axios';

// const BASE_URL = 'http://localhost:3003/api/orders';

// // POST - Create a new order
// export const asynccreateorder = async (shippingAddress) => {
//     try {
//         const res = await axios.post(BASE_URL, {
//             shippingAddress
//         }, {
//             withCredentials: true
//         });
//         console.log('Order created:', res.data.order);
//         return res.data.order;
//     } catch (err) {
//         console.error('Error creating order:', err);
//         throw err;
//     }
// };

import axios from "axios";

const BASE_URL = "http://localhost:3003/api/orders";

export const asynccreateorder = async (shippingAddress) => {
  try {
    const token = localStorage.getItem("token"); // 👈 IMPORTANT

    const res = await axios.post(
      BASE_URL,
      { shippingAddress },
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`, // ✅ REQUIRED
        },
      }
    );

    return res.data.order;
  } catch (err) {
    console.error(
      "Error creating order:",
      err.response?.data || err.message
    );
    throw err;
  }
};


// GET - Get all my orders with pagination
export const asyncgetmyorders = async (page = 1, limit = 10) => {
    try {
        const res = await axios.get(`${BASE_URL}/me`, {
            params: { page, limit },
            withCredentials: true
        });
        console.log('Orders fetched:', res.data);
        return res.data; // Returns { orders, meta: { total, page, limit } }
    } catch (err) {
        console.error('Error fetching orders:', err);
        throw err;
    }
};

// GET - Get order by ID
export const asyncgetorderbyid = async (orderId) => {
    try {
        const res = await axios.get(`${BASE_URL}/${orderId}`, {
            withCredentials: true
        });
        console.log('Order fetched:', res.data.order);
        return res.data.order;
    } catch (err) {
        console.error('Error fetching order:', err);
        throw err;
    }
};

// POST - Cancel order by ID
export const asynccancelorder = async (orderId) => {
    try {
        const res = await axios.post(`${BASE_URL}/${orderId}/cancel`, {}, {
            withCredentials: true
        });
        console.log('Order cancelled:', res.data.order);
        return res.data.order;
    } catch (err) {
        console.error('Error cancelling order:', err);
        throw err;
    }
};

// PATCH - Update order shipping address
export const asyncupdateorderaddress = async (orderId, shippingAddress) => {
    try {
        const res = await axios.patch(`${BASE_URL}/${orderId}/address`, {
            shippingAddress
        }, {
            withCredentials: true
        });
        console.log('Order address updated:', res.data.order);
        return res.data.order;
    } catch (err) {
        console.error('Error updating order address:', err);
        throw err;
    }
};