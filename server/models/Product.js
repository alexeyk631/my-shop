const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    manufacturer_id: { type: Number },
    name: { type: String, required: true, maxlength: 255 },
    alias: { type: String, maxlength: 255 },
    short_description: { type: String },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    available: { type: Boolean, default: true },
    meta_keywords: [{ type: String }],
    meta_description: { type: String },
    meta_title: { type: String },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    category: { type: String, default: "Разное" },
    price: { type: Number, required: true },
    old_price: { type: Number } // <-- Добавь эту строку
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);