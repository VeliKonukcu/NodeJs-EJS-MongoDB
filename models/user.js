const mongoose = require("mongoose");
const { isEmail } = require("validator");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      validate: [isEmail, "Geçersiz email adresi"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetToken: String,
    resetTokenExpiration: Date,
    isAdmin: {
      type: Boolean,
      default: false,
    },
    cart: {
      items: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
        },
      ],
    },
  },
  { strict: "throw" },
);

userSchema.methods.addToCart = async function (product) {
  const pIndex = this.cart.items.findIndex(
    (p) => p.productId.toString() === product._id.toString(),
  );
  if (pIndex >= 0) {
    this.cart.items[pIndex].quantity += 1;
  } else {
    this.cart.items.push({
      productId: product._id,
      quantity: 1,
    });
  }
  return await this.save();
};

userSchema.methods.deleteCartItem = async function (id) {
  this.cart.items = this.cart.items.filter(
    (i) => i.productId.toString() !== id.toString(),
  );

  return await this.save();
};

// userSchema.methods.getCart = async function () {
//   const cartMap = {};
//   this.cart.items.forEach((i) => (cartMap[i.productId] = i.quantity));

//   const products = await ProductModel.find()
//     .select("name price imageUrl")
//     .lean();

//   return products
//     .map((p) => {
//       const quantity = cartMap[p._id.toString()];

//       return quantity ? { ...p, quantity: quantity } : null;
//     })
//     .filter(Boolean);
// };

module.exports = mongoose.model("User", userSchema);
