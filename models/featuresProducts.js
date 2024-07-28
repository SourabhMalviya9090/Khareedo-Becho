const mongoose = require("mongoose");
const Product = require("../models/product.model");
const featuredProducts = new mongoose.Schema(
  {
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeaturedProducts", featuredProducts);
