import axios from 'axios';

export const asyncgetproducts=async()=>{
    try{
        const res=await axios.get(`${import.meta.env.VITE_API_BASE_URL}/product/api/products`,{
            withCredentials:true
        });
        return(res.data.data);
    }catch(err){
        console.log(err);
    }
}



const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/product/api`;

/* ===============================
   Get all seller products
================================ */
export const asyncgetSellerProducts = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/products/seller`,
      { withCredentials: true }
    );
    return res.data.data;
  } catch (err) {
    console.log('Error fetching seller products:', err);
  }
};


/* ===============================
   Create product
================================ */
export const asynccreateProduct = async (productData) => {
  try {
    const formData = new FormData();
    formData.append('title', productData.title);
    formData.append('description', productData.description);
    formData.append('priceAmount', productData.priceAmount);
    formData.append('priceCurrency', productData.priceCurrency);
    formData.append('stock', productData.stock);

    productData.images.forEach((image) => {
      formData.append('images', image);
    });

    const res = await axios.post(
      `${BASE_URL}/products`,
      formData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return res.data;
  } catch (err) {
    console.log('Error creating product:', err);
  }
};


/* ===============================
   Update product
================================ */
export const asyncupdateProduct = async (productId, productData) => {
  try {
    const updateData = {
      title: productData.title,
      description: productData.description,
      price: {
        amount: productData.priceAmount,
        currency: productData.priceCurrency,
      },
      stock: productData.stock,
    };

    const res = await axios.patch(
      `${BASE_URL}/products/${productId}`,
      updateData,
      { withCredentials: true }
    );

    return res.data;
  } catch (err) {
    console.log('Error updating product:', err);
  }
};


/* ===============================
   Delete product
================================ */
export const asyncdeleteProduct = async (productId) => {
  try {
    const res = await axios.delete(
      `${BASE_URL}/products/${productId}`,
      { withCredentials: true }
    );

    return res.data;
  } catch (err) {
    console.log('Error deleting product:', err);
  }
};
