const express=require('express');
const validators=require('../middlewares/validator.middleware');
const authControllers=require('../controllers/auth.controller');
const authMiddleware=require('../middlewares/auth.middleware');
const router=express.Router();

//POST -api/auth/register
router.post('/register',validators.registerUserValidations,authControllers.registerUser);
//POST-api/auth/login
router.post('/login',validators.loginUserValidations,authControllers.loginUser); 
//GET-api/auth/me
router.get('/me',authMiddleware.authMiddleware,authControllers.getCurrentUser);
//GET-logout route
router.post('/logout',authControllers.logoutUser);
//GET-user addresses
router.get('/users/me/addresses',authMiddleware.authMiddleware,authControllers.getUserAddresses);
//POST-user addresses
router.post('/users/me/addresses',validators.addUserAddressValidations,authMiddleware.authMiddleware,authControllers.addUserAddress);
//DELETE-user addresses
router.delete('/users/me/addresses/:addressId',authMiddleware.authMiddleware,authControllers.deleteUserAddress);
module.exports=router;
