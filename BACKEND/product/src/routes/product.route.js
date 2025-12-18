const express = require("express");
const multer = require("multer");
const createAuthMiddleware = require("../middleware/auth.middleware");
const { createProductValidators } = require("../validators/product.validators");
const productController = require("../controller/product.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


//POST-api/products
router.post(
  "/",
  createAuthMiddleware([  "seller" ]),
  upload.array("images", 4), 
  createProductValidators,     
  productController.createProduct
);
//GET-api/products
router.get("/", productController.getProducts);


//GET-api/products/seller
router.get("/seller",createAuthMiddleware([ "seller" ]), productController.getProductsBySeller);


//GET-api/products/:id


router.get('/:id',productController.getProductById);

//PATCH-/api/products/:id
router.patch('/:id',createAuthMiddleware(["seller"]),productController.updateProduct);

//DELETE-/api/products/:id
router.delete('/:id',createAuthMiddleware(["seller"]),productController.deleteProduct)

module.exports = router;
