const session = require("express-session");
const UserModel = require("../models/user");
const bcrypt = require("bcrypt");
const nodeMailer = require("../mail/nodeMailer");
const crypto = require("crypto");

exports.getLogin = (req, res, next) => {
  try {
    const errMsg = req.session.errorMessage;
    delete req.session.errorMessage;
    res.render("account/login", {
      path: "/login",
      title: "Login",
      isAuthenticated: req.session.isAuthenticated,
      errorMessage: errMsg || "",
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    next(err);
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (user) {
      const isvalid = await bcrypt.compare(req.body.password, user.password);
      if (isvalid) {
        req.session.user = { _id: user._id.toString() };
        req.session.isAuthenticated = true;
        req.session.save(function (err) {
          if (err) {
            console.log(err);
          }
          const url = req.session.redirectTo || "/";
          delete req.session.redirectTo;
          res.redirect(url);
        });
      } else {
        req.session.errorMessage = "Şifre mail adresiniz ile uyumsuzdur.";
        req.session.save((err) => {
          if (err) {
            console.log(err);
          }
          res.redirect("/login");
        });
      }
    } else {
      req.session.errorMessage =
        "Bu mail adresi ile ilgili bir kayıt bulunamamıştır.";
      req.session.save((err) => {
        if (err) {
          console.log(err);
        }
        res.redirect("/login");
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getLogout = (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      }
      res.redirect("/");
    });
  } catch (err) {
    next(err);
  }
};

exports.getRegister = (req, res, next) => {
  try {
    const errMsg = req.session.errorMessage;
    delete req.session.errorMessage;
    res.render("account/register", {
      path: "/register",
      title: "Register",
      errorMessage: errMsg || "",
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    next(err);
  }
};

exports.postRegister = async (req, res, next) => {
  try {
    const existingUser = await UserModel.findOne({ email: req.body.email });
    if (!existingUser) {
      const newUser = new UserModel({
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 10),
        cart: {
          items: [],
        },
      });

      await newUser.save();

      nodeMailer(
        req.body.email,
        "Hesap oluşturma",
        req.body.name,
        "accountCreate",
        "",
      );

      res.redirect("/login");
    } else {
      req.session.errorMessage = "Bu mail adresi sistemde kayıtlıdır.";
      req.session.save((err) => {
        if (err) {
          console.log(err);
        }
        res.redirect("/register");
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getReset = (req, res, next) => {
  try {
    const errMsg = req.session.errorMessage;
    delete req.session.errorMessage;

    res.render("account/reset", {
      path: "/reset-password",
      title: "Reset Password",
      errorMessage: errMsg || "",
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    next(err);
  }
};

exports.postReset = async (req, res, next) => {
  try {
    crypto.randomBytes(64, async (err, buffer) => {
      if (err) {
        console.log(err);
        return res.redirect("/reset-password");
      }
      const token = buffer.toString("hex");
      const user = await UserModel.findOne({ email: req.body.email });
      if (user) {
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 1000 * 60 * 60;
        await user.save();

        nodeMailer(
          req.body.email,
          "Parola Sıfırlama",
          user.name,
          "passwordReset",
          token,
        );

        res.redirect("/");
      } else {
        req.session.errorMessage = "Mail adresi bulunamadı";
        req.session.save((err) => {
          if (err) {
            console.log(err);
          }
          res.redirect("/reset-password");
        });
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getNewPassword = async (req, res, next) => {
  try {
    const user = await UserModel.findOne({
      resetToken: req.params.token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    const errMsg = req.session.errorMessage;
    delete req.session.errorMessage;
    if (user) {
      res.render("account/newPassword", {
        path: "/new-password/",
        title: "New Password",
        errorMessage: errMsg || "",
        userId: user._id.toString(),
        passwordToken: req.params.token,
        csrfToken: req.csrfToken(),
      });
    } else {
      req.session.errorMessage =
        "Parola sıfırlama işleminin süresi geçmiş yada bilgiler hatalı";
      req.session.save((err) => {
        if (err) {
          console.log(err);
        }
        res.redirect("/reset-password");
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.postNewPassword = async (req, res, next) => {
  try {
    const newPassword = req.body.password;
    const token = req.body.passwordToken;
    const userId = req.body.userId;

    const user = await UserModel.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });

    if (user) {
      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      await user.save();

      res.redirect("/login");
    } else {
      req.session.errorMessage =
        "Parola sıfırlama işleminin süresi geçmiş ya da bilgiler hatalı";
      req.session.save((err) => {
        if (err) {
          console.log(err);
        }
        res.redirect(`/new-password/${token}`);
      });
    }
  } catch (error) {
    next(err);
  }
};
