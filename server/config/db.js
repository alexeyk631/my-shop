const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/products_db");
    console.log("✅ MongoDB подключена локально");
  } catch (err) {
    console.error("❌ Ошибка подключения:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;