const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const expressLayout = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const mongoDbStore = require("connect-mongodb-session")(session);
require("dotenv").config();
const UserModel = require("./models/user");

const adminRotes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const accountRoutes = require("./routes/account");

const controllerError = require("./controllers/error");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-xta4ped-shard-00-00.lhqlslw.mongodb.net:27017,ac-xta4ped-shard-00-01.lhqlslw.mongodb.net:27017,ac-xta4ped-shard-00-02.lhqlslw.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-11fou4-shard-0&authSource=admin&appName=Cluster0`;

const store = new mongoDbStore({
  uri: url,
  collection: "mySession",
});

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
    store: store,
  }),
);

app.set("view engine", "ejs");
app.use(expressLayout);
app.set("layout", "layout");

app.use(express.static("public"));

app.use((req, res, next) => {
  res.locals.head = "";
  res.locals.script = "";
  res.locals.currentPath = req.path;
  res.locals.originalUrl = req.originalUrl;
  res.locals.isAuthenticated = req.session.isAuthenticated;

  next();
});

app.use(async (req, res, next) => {
  const userInfo = req.session.user;
  if (userInfo) {
    const user = await UserModel.findById(userInfo._id);
    if (user) {
      req.user = user;
      res.locals.isAdmin = user.isAdmin;
    }
  }
  next();
});

app.use("/admin", adminRotes);
app.use(shopRoutes);
app.use(accountRoutes);

app.use(controllerError.get404Page);

app.use((error, req, res, next) => {
  if (error.code === "EBADCSRFTOKEN") {
    return res.status(403).send("CSRF token invalid");
  }
  res.status(500).render("errors/500", {
    title: error.name,
    name: error.name,
    message: error.message,
  });
});

async function connection() {
  try {
    await mongoose.connect(url);
    mongoose.set("strictQuery", true);
    console.log("Connected to MongoDb via Mongoose");

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  } catch (err) {
    console.log(err);
  }
}
connection();
