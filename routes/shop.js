const express = require("express");
const router = express.Router();
const controllerShop = require("../controllers/shop");
const authenticated = require("../middleware/authentication");
const csrf = require("csurf");

const csrfProtection = csrf();

router.get("/", csrfProtection, controllerShop.getHomePage);

router.get("/products", csrfProtection, controllerShop.getProducts);

router.get("/details/:id", csrfProtection, controllerShop.getProduct);

router.get(
  "/categories/:categoryId",
  csrfProtection,
  controllerShop.getProductsByCategory,
);

router.get("/cart", authenticated, csrfProtection, controllerShop.getCart);

router.post(
  "/cart/:id",
  authenticated,
  csrfProtection,
  controllerShop.postCart,
);

router.post(
  "/delete-cartItem",
  authenticated,
  csrfProtection,
  controllerShop.deleteCartItem,
);

router.get("/orders", authenticated, controllerShop.getOrders);

router.post(
  "/create-order",
  authenticated,
  csrfProtection,
  controllerShop.postOrder,
);

module.exports = router;
