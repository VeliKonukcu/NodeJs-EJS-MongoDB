const express = require("express");
const router = express.Router();
const accountController = require("../controllers/account");
const csrf = require("csurf");

const csrfProtection = csrf();

router.get("/login", csrfProtection, accountController.getLogin);
router.post("/login", csrfProtection, accountController.postLogin);

router.get("/logout", csrfProtection, accountController.getLogout);

router.get("/register", csrfProtection, accountController.getRegister);
router.post("/register", csrfProtection, accountController.postRegister);

router.get("/reset-password", csrfProtection, accountController.getReset);
router.post("/reset-password", csrfProtection, accountController.postReset);

router.get(
  "/new-password/:token",
  csrfProtection,
  accountController.getNewPassword,
);
router.post("/new-password", csrfProtection, accountController.postNewPassword);

module.exports = router;
