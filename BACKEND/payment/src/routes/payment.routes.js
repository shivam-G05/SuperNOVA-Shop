const express = require('express');
const createAuthMiddleware = require("../middlewares/auth.middleware")
const paymentController = require("../controllers/payment.controller")



const router = express.Router();


router.post("/create/:orderId", createAuthMiddleware([ "user","seller" ]), paymentController.createPayment)

router.post("/verify", createAuthMiddleware([ "user","seller" ]), paymentController.verifyPayment)

module.exports = router;
