const mongoose = require("mongoose");

const userActionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true }, // 'login', 'register', 'add_to_cart', 'update_profile', 'add_feedback'
  details: { type: String },               // Доп. информация (например, название товара)
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserAction", userActionSchema);