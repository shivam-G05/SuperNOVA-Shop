const express=require('express');
const createAuthMiddleware=require('../middlewares/auth.middleware');
const validation=require('../middlewares/validation.middleware');
const orderController=require('../controllers/order.controller');
const router=express.Router();
//post-api/orders
router.post('/',createAuthMiddleware(['user',"seller"]),validation.createOrderValidation,orderController.createOrder);
//get-api/orders
router.get('/me',createAuthMiddleware(['user',"seller"]),orderController.getMyOrders);
//get-api/orders/:id
router.get('/:id',createAuthMiddleware(['user','admin',"seller"]),orderController.getOrderById)
//post-api/orders/:id/cancel
router.post('/:id/cancel',createAuthMiddleware(["user","seller"]),orderController.cancelOrderById);
//patch-api/orders/id/address
router.patch("/:id/address", createAuthMiddleware([ "user","seller" ]), validation.updateAddressValidation, orderController.updateOrderAddress)
module.exports=router;
