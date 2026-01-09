// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      required: true,
    },
    // AJOUTE ÇA OBLIGATOIREMENT
    category: {
      type: String,
      required: true,                    // ← C’est ce qui manquait !
      enum: [
        "Cookies",
        "mini-cookies",
        "brownies"
      ],
    },
    badge: {
      type: String,
      enum: ["Best Seller", "Popular", "Few stocks left"],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);