const userModel = require("../models/user.model")
const productModel = require("../models/product.model")
const orderModel = require("../models/order.model")
const paymentModel = require("../models/payment.model")
const mongoose = require('mongoose');

async function getProducts(req, res) {
    try {
        console.log('=== GET PRODUCTS ===');
        const seller = req.user;
        
        // Use seller.id instead of seller._id
        let products = await productModel.find({ 
            seller: seller.id 
        }).sort({ createdAt: -1 });
        
        console.log('Products found:', products.length);
        
        return res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

async function getMetrics(req, res) {
    try {
        const seller = req.user;

        // Use seller.id
        const products = await productModel.find({ seller: seller.id });
        const productIds = products.map(p => p._id);

        const orders = await orderModel.find({
            'items.product': { $in: productIds },
            status: { $in: ["CONFIRMED", "SHIPPED", "DELIVERED"] }
        });

        let sales = 0;
        let revenue = 0;
        const productSales = {};

        orders.forEach(order => {
            order.items.forEach(item => {
                const itemProductId = item.product.toString();
                if (productIds.some(pid => pid.toString() === itemProductId)) {
                    sales += item.quantity;
                    revenue += item.price.amount * item.quantity;
                    productSales[itemProductId] = (productSales[itemProductId] || 0) + item.quantity;
                }
            });
        });

        const topProducts = Object.entries(productSales)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([productId, qty]) => {
                const prod = products.find(p => p._id.toString() === productId);
                return prod ? { id: prod._id, title: prod.title, sold: qty } : null;
            })
            .filter(Boolean);

        return res.json({
            sales,
            revenue,
            topProducts
        });
    } catch (error) {
        console.error("Error fetching metrics:", error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function getOrders(req, res) {
    try {
        const seller = req.user;

        // Use seller.id
        const products = await productModel.find({ seller: seller.id });
        const productIds = products.map(p => p._id);

        const orders = await orderModel.find({
            'items.product': { $in: productIds }
        }).populate('user', 'name email').sort({ createdAt: -1 });

        const filteredOrders = orders.map(order => {
            const filteredItems = order.items.filter(item => 
                productIds.some(pid => pid.toString() === item.product.toString())
            );
            return {
                ...order.toObject(),
                items: filteredItems
            };
        }).filter(order => order.items.length > 0);

        return res.json(filteredOrders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

module.exports = {
    getMetrics,
    getOrders,
    getProducts
}