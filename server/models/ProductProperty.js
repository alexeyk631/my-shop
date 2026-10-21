const mongoose = require("mongoose");

const productPropertySchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  property_name: { type: String, required: true, maxlength: 255 },
  property_value: { type: String, required: true, maxlength: 255 },
  property_price: { type: Number, required: true },
});

module.exports = mongoose.model("ProductProperty", productPropertySchema);