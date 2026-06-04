const ProductModel = require("../models/product");
const CategoryModel = require("../models/category");
const OrderModel = require("../models/order");

exports.getHomePage = async (req, res, next) => {
  try {
    const products = await ProductModel.find();
    const categories = await CategoryModel.find().select("name");
    const errMsg = req.session.errorMessage;
    delete req.session.errorMessage;
    res.render("shop/index", {
      title: "Home Page",
      products: products,
      categories: categories,
      selectedCategory: null,
      errorMessage: errMsg,
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await ProductModel.find();
    const categories = await CategoryModel.find().select("name");

    res.render("shop/products", {
      title: "Products",
      products: products,
      categories: categories,
      selectedCategory: null,
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id).populate(
      "categoryIds",
    );

    res.render("shop/details", {
      title: product.name,
      product: product,
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    next(err);
  }
};

exports.getProductsByCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId;

    const products = await ProductModel.find({ categoryIds: categoryId });

    const categories = await CategoryModel.find().select("name");

    res.render("shop/products", {
      title: "Products by selected category",
      products: products,
      categories: categories,
      selectedCategory: categoryId,
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    next(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId");

    res.render("shop/cart", {
      title: "Cart",
      products: user.cart.items,
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    next(err);
  }
};

exports.postCart = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    await req.user.addToCart(product);

    res.redirect("/cart");
  } catch (err) {
    next(err);
  }
};

exports.deleteCartItem = async (req, res, next) => {
  try {
    await req.user.deleteCartItem(req.body.productId);
    res.redirect("/cart");
  } catch (err) {
    next(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await OrderModel.find({ userId: req.user._id });
    res.render("shop/orders", {
      title: "Orders",
      orders: orders,
    });
  } catch (error) {
    next(err);
  }
};

exports.postOrder = async (req, res, next) => {
  try {
    const user = await req.user.populate({
      path: "cart.items.productId",
    });

    const items = user.cart.items.map((item) => ({
      productId: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      imageUrl: item.productId.imageUrl,
      quantity: item.quantity,
    }));

    const order = new OrderModel({
      userId: req.user._id,
      user: {
        name: req.user.name,
        email: req.user.email,
      },
      items,
    });
    await order.save();

    req.user.cart.items = [];
    await req.user.save();

    res.redirect("/orders");
  } catch (err) {
    next(err);
  }
};
