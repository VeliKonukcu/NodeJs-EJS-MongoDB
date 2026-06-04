exports.get404Page = (req, res) => {
  res.status(404);
  // res.sendFile(path.join(__dirname, "/views", "404.ejs"));
  res.render("errors/404", {
    title: "Page Not Found",
  });
};
