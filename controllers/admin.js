const ProductModel = require("../models/product");
const CategoryModel = require("../models/category");
const fs = require("fs");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await ProductModel.find({ userId: req.user._id })
      .select("name price imageUrl userId categoryIds")
      .populate(["userId", "categoryIds"]);

    const categories = await CategoryModel.find().select("name");

    const errMsg = req.session.errorMessage;
    if (req.user.isAdmin) {
      delete req.session.errorMessage;
    }

    res.render("admin/products", {
      title: "Admin Products",
      products: products,
      categories: categories,
      action: req.query.action,
      selectedCategory: null,
      errorMessage: errMsg,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProductsByCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId;
    const products = await ProductModel.find({
      categoryIds: categoryId,
    }).populate("categoryIds");
    const categories = await CategoryModel.find().select("name");

    res.render("admin/products", {
      title: "Products By Category",
      products: products,
      categories: categories,
      action: req.query.action,
      selectedCategory: categoryId,
      errorMessage: "",
    });
  } catch (err) {
    next(err);
  }
};

exports.getAddProduct = async (req, res, next) => {
  try {
    const categories = await CategoryModel.find().select("name");
    res.render("admin/add-product", {
      title: "Add Product",
      categories: categories,
      errorMessage: "",
      oldValues: {},
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    next(err);
  }
};

exports.postAddProduct = async (req, res, next) => {
  let productValues;
  try {
    productValues = {
      name: req.body.name,
      price: req.body.price,
      imageUrl: req.file?.filename || undefined,
      description: req.body.description,
      categoryIds: req.body.categoryIds,
      userId: req.user._id,
      isActive: true,
      tags: "Akıllı",
    };
    const product = new ProductModel(productValues);
    await product.save();
    res.redirect("/admin/products");
  } catch (err) {
    if (err.name == "ValidationError") {
      const categories = await CategoryModel.find().select("name");
      const errorMessage = err.message.replaceAll(".,", "<br>");
      res.render("admin/add-product", {
        title: "Add Product",
        categories: categories,
        errorMessage: errorMessage,
        oldValues: productValues,
        csrfToken: req.csrfToken(),
      });
    } else {
      next(err);
    }
  }
};

exports.getEditProduct = async (req, res, next) => {
  try {
    const product = await ProductModel.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    let categories = await CategoryModel.find().lean();

    if (product) {
      const categoryIds = product.categoryIds.map((i) => i.toString());

      categories = categories.map((c) => ({
        ...c,
        checked: categoryIds.includes(c._id.toString()),
      }));
      res.render("admin/edit-product", {
        title: product.name,
        product: product,
        categories: categories,
        csrfToken: req.csrfToken(),
      });
    } else {
      req.session.errorMessage = "Ürün bulunamadı ya da yetkiniz yok.";
      req.session.save((err) => {
        if (err) {
          console.log(err);
        }
        res.redirect("/admin/products");
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.postEditProduct = async (req, res, next) => {
  try {
    const product = await ProductModel.findOne({
      _id: req.body.id,
      userId: req.user._id,
    });

    product.name = req.body.name;
    product.price = req.body.price;
    product.categoryIds = req.body.categoryIds || [];
    product.description = req.body.description;

    if (req.file) {
      await fs.unlink(
        "public/images/" + product.imageUrl,
        (err) => err && console.log(err),
      );
      product.imageUrl = req.file.filename;
    }
    await product.save();
    res.redirect("/admin/products?action=edit");
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await ProductModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (product) {
      await fs.unlink(
        "public/images/" + product.imageUrl,
        (err) => err && console.log(err),
      );
      res.redirect("/admin/products?action=delete");
    } else {
      req.session.errorMessage = "Silme işlemi başarısız.";
      req.session.save((err) => (err ? console.log(err) : ""));
      res.redirect("/admin/products");
    }
  } catch (err) {
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await CategoryModel.find();
    res.render("admin/categories", {
      title: "Categories",
      action: req.query.action,
      categories: categories,
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    next(err);
  }
};

exports.getAddCategory = async (req, res, next) => {
  try {
    res.render("admin/add-category", {
      title: "Add Category",
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    next(err);
  }
};

exports.postAddCategory = async (req, res, next) => {
  try {
    const category = new CategoryModel({
      name: req.body.name,
      description: req.body.description,
    });
    category.save();

    res.redirect("/admin/categories");
  } catch (err) {
    next(err);
  }
};

exports.getEditCategory = async (req, res, next) => {
  try {
    const category = await CategoryModel.findById(req.params.id);

    if (!category) {
      return res.redirect("/admin/categories");
    }

    res.render("admin/edit-category", {
      title: "Edit Category",
      category: category,
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    next(err);
  }
};

exports.postEditCategory = async (req, res, next) => {
  try {
    const category = await CategoryModel.findById(req.params.id);

    category.name = req.body.name;
    category.description = req.body.description;

    await category.save();

    res.redirect("/admin/categories?action=edit");
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await CategoryModel.findByIdAndDelete(req.params.id);

    res.redirect("/admin/categories?action=delete");
  } catch (err) {
    next(err);
  }
};
