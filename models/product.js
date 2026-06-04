const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      lowercase: true,
      trim: true,
    },
    price: {
      type: Number,
      required: function () {
        return this.isActive;
      },
      min: 0,
      max: 10000000,
      get: (value) => Math.round(value),
      set: (value) => Math.round(value),
    },
    description: {
      type: String,
      minlength: 3,
      maxlength: 255,
      lowercase: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Bir resim seçiniz."],
      lowercase: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    categoryIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    tags: {
      type: Array,
      validate: {
        validator: function (value) {
          return value && value.length > 0;
        },
        message: "Ürüne en az bir tane etiket ekleyiniz.",
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: Boolean,
  },
  { strict: "throw" },
);

module.exports = mongoose.model("Product", productSchema);
