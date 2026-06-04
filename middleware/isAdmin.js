module.exports = (req, res, next) => {
  if (!req.session.isAuthenticated) {
    req.session.redirectTo = req.originalUrl;
    return res.redirect("/login");
  }
  if (!req.user || !req.user.isAdmin) {
    req.session.errorMessage =
      "İşlemi gerçekleştirmek için gerekli yetkiye sahip değilsiniz.";
    req.session.save((err) => (err ? console.log(err) : ""));
    return res.redirect("/");
  }
  next();
};
