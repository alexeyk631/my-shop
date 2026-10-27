const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect("mongodb+srv://admin:12345@cluster0.nz1quu4.mongodb.net/products_db?retryWrites=true&w=majority");
    console.log("✅ MongoDB Atlas подключена");
  } catch (err) {
    console.error("❌ Ошибка подключения:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;