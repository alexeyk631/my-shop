const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  total: { type: Number, required: true },
  status: { type: String, default: "В обработке" }, // 'В обработке', 'Отправлен', 'Доставлен'
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);