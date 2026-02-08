const express=require('express');
const createAuthMiddleware=require('../middleware/auth.middleware');
const validation=require('../middleware/validation.middleware');
const cartController=require('../controller/cart.controller');
const router=express.Router();

//GET-API/CART/items
router.get('/',createAuthMiddleware(["user","seller"]),cartController.getCart);

//POST-api/cart/items
router.post('/items',validation.validateAddItemToCart,createAuthMiddleware(["user","seller"]),cartController.addItemToCart);

//PAST-api/cart/items
router.patch('/items/:productId',validation.validateUpdateCartItem,createAuthMiddleware(["user","seller"]),cartController.updateItemQuantity);

//DELETE-api/cart/items
router.delete('/items/:productId',createAuthMiddleware(["user","seller"]),cartController.removeItemFromCart);

module.exports=router;