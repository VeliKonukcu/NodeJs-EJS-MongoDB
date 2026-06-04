const express = require("express");
const router = express.Router();
const controllerAdmin = require("../controllers/admin");
const isAdmin = require("../middleware/isAdmin");
const upload = require("../utility/multer");
const csrf = require("csurf");

const csrfProtection = csrf();

router.get("/products", isAdmin, controllerAdmin.getProducts);

router.get(
  "/products/:categoryId",
  isAdmin,
  controllerAdmin.getProductsByCategory,
);

router.get(
  "/add-products",
  isAdmin,
  csrfProtection,
  controllerAdmin.getAddProduct,
);

router.post(
  "/add-products",
  isAdmin,
  upload.single("image"),
  csrfProtection,
  controllerAdmin.postAddProduct,
);

router.get(
  "/edit-product/:id",
  isAdmin,
  csrfProtection,
  controllerAdmin.getEditProduct,
);

router.post(
  "/edit-product",
  isAdmin,
  upload.single("image"),
  csrfProtection,
  controllerAdmin.postEditProduct,
);

router.post(
  "/delete-product/:id",
  isAdmin,
  csrfProtection,
  controllerAdmin.deleteProduct,
);

router.get(
  "/categories",
  isAdmin,
  csrfProtection,
  controllerAdmin.getCategories,
);

router.get(
  "/add-category",
  isAdmin,
  csrfProtection,
  controllerAdmin.getAddCategory,
);

router.post(
  "/add-category",
  isAdmin,
  csrfProtection,
  controllerAdmin.postAddCategory,
);

router.get(
  "/edit-category/:id",
  isAdmin,
  csrfProtection,
  controllerAdmin.getEditCategory,
);

router.post(
  "/edit-category/:id",
  isAdmin,
  csrfProtection,
  controllerAdmin.postEditCategory,
);

router.post(
  "/delete-category/:id",
  isAdmin,
  csrfProtection,
  controllerAdmin.deleteCategory,
);

module.exports = router;
