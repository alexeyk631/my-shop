const mongoose = require("mongoose");

const productImageSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  image: { type: String, required: true, maxlength: 255 },
  title: { type: String, required: true, maxlength: 255 },
});

module.exports = mongoose.model("ProductImage", productImageSchema);