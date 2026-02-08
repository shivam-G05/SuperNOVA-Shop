const orderModel=require('../models/order.model');
const axios =require('axios');
const { promises } = require("supertest/lib/test");
const { publishToQueue } = require("../broker/broker");

async function createOrder(req, res) {

  if (!req.body.shippingAddress) {
    return res.status(400).json({
      message: "Shipping address is required",
    });
  }
  console.log("Received shipping address:", req.body.shippingAddress); 


  const user = req.user;
  const token =req.cookies?.token ||req.headers?.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No auth token" });
  }

  try {
    const cartResponse = await axios.get(
      `https://supernova-shop-cart.onrender.com/api/cart`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const products = await Promise.all(
      cartResponse.data.cart.items.map(async (item) => {
        return (
          await axios.get(
            `https://supernova-shop-product.onrender.com/api/products/${item.productId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        ).data.data;
      })
    );

    let priceAmount = 0;

    const orderItems = cartResponse.data.cart.items.map(
      (item) => {
        const product = products.find(
          (p) =>
            p._id.toString() ===
            item.productId.toString()
        );

        // ✅ safety check
        if (!product) {
          throw new Error(
            `Product not found: ${item.productId}`
          );
        }

        // ✅ stock validation
        if (product.stock < item.quantity) {
          throw new Error(
            `Product ${product.title} has insufficient stock`
          );
        }

        const itemTotal =
          product.price.amount * item.quantity;

        priceAmount += itemTotal;

        return {
          product: item.productId,
          quantity: item.quantity,
          price: {
            amount: itemTotal,
            currency: product.price.currency,
          },
        };
      }
    );

    
    const order = await orderModel.create({
      user: user.id,
      items: orderItems,
      status: "PENDING",
      totalPrice: {
        amount: priceAmount,
        currency: "INR",
      },
      shippingAddress: {
  street: req.body.shippingAddress.street,
  city: req.body.shippingAddress.city,
  state: req.body.shippingAddress.state,
  pincode: req.body.shippingAddress.pincode, 
  country: req.body.shippingAddress.country,
},

    });

    await publishToQueue(
      "ORDER_SELLER_DASHBOARD.ORDER_CREATED",
      order
    );

    return res.status(201).json({ order });

  }catch (err) {
    // Check if the error came from an internal Axios call (to Cart or Product service)
    if (err.response) {
        console.error(`CRITICAL: Internal Service (${err.config.url}) returned ${err.response.status}`);
        return res.status(err.response.status).json({
            message: `Internal Service Error: ${err.response.data.message || 'Service unreachable'}`,
            failedUrl: err.config.url
        });
    }

    console.error("Logic Error:", err.message);
    return res.status(400).json({
        message: err.message
    });
}

}


async function getMyOrders(req,res){
    const user=req.user;
    const page=parseInt(req.query.page)||1;
    const limit=parseInt(req.query.limit)||10;
    const skip=(page-1)*limit;

    try{
        const orders=await orderModel.find({user:user.id}).skip(skip).limit(limit).exec();
        const totalOrders=await orderModel.countDocuments({user:user.id});
        res.status(200).json({
            orders,
            meta: {
                total: totalOrders,
                page,
                limit
            }
        })
    } catch (err) {
        res.status(500).json({ message: "Internal server error", error: err.message })
    }
}

async function getOrderById(req,res){
    const user=req.user;
    const orderId=req.params.id;
    try{
        const order=await orderModel.findById(orderId);
        if(!order){
            return res.status(404).json({
                message:"Order not found"
            })
        }
        if(order.user.toString()!==user.id){
            return res.status(403).json({
                message:"Forbidden access..you cannot access this order product"
            })
        }
        return res.status(200).json({
            order
        })
    }catch(err){
        return res.status(500).json({
            message:"Internal Server error"
        })
    }
}

async function cancelOrderById(req,res){
    const user=req.user;
    const orderId=req.params.id;
    try{
        const order=await orderModel.findById(orderId);
        if(!order){
            return res.status(404).json({
                message:"Order Not Found"
            })
        }
        if(order.user.toString()!==user.id){
            return res.status(403).json({
                message:"you are not allowed to cancel this order"
            })
        }
        if(order.status!=="PENDING"){
            return res.status(409).json({
                message:"You cannot cancel this order now"
            })
        }
        order.status="CANCELLED";
        await order.save()
        return res.status(200).json({
            order
        })

    }catch(err){
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

async function updateOrderAddress(req,res){
    const user=req.user;
    const orderId=req.params.id;

    try{
        const order=await orderModel.findById(orderId);
        if(!order){
            return res.status(404).json({
                message:"Order Not Found"
            })
        }
        if(order.user.toString()!==user.id){
            return res.status(403).json({
                message:"Forbidden:You do not have acces to change the shipping adress of this order"
            })
        }
        if(order.status!=="PENDING"){
            return res.status(409).json({message:"You cannot update the Address at this stage"})
        }
        order.shippingAddress={
            street: req.body.shippingAddress.street,
            city: req.body.shippingAddress.city,
            state: req.body.shippingAddress.state,
            pincode: req.body.shippingAddress.pincode,
            country: req.body.shippingAddress.country,
        }
        await order.save();
        res.status(200).json({
            order
        })

    }catch(err){
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
}


module.exports={
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrderById,
    updateOrderAddress
}