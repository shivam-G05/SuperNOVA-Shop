import axios from 'axios';

const BASE_URL = `http://localhost:3007/api/seller/dashboard`;

/* ===============================
   Get seller dashboard metrics
================================ */
export const asyncgetSellerMetrics = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/metrics`,
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.log('Error fetching metrics:', err);
    throw err;
  }
};


/* ===============================
   Get seller orders
================================ */
export const asyncgetSellerOrders = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/orders`,
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.log('Error fetching orders:', err);
    throw err;
  }
};


/* ===============================
   Get seller products
================================ */
export const asyncgetSellerDashboardProducts = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/products`,
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.log('Error fetching products:', err);
    throw err;
  }
};
