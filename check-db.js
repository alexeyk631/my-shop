const mongoose = require("mongoose");

// ЗАМЕНИ НА СВОЙ ПОРТ ИЗ ЛОГА СЕРВЕРА
const MONGO_URI = "mongodb://127.0.0.1:35185/";

async function checkDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Подключено к MongoDB:", MONGO_URI);

    // Получаем список коллекций
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log("\n📦 Коллекции в базе:");
    collections.forEach((c) => console.log("  -", c.name));

    // Смотрим пользователей
    console.log("\n👤 Пользователи:");
    const users = await mongoose.connection.db
      .collection("users")
      .find()
      .toArray();
    users.forEach((u) => {
      console.log(`  - ${u.name} <${u.email}> | role: ${u.role} | создан: ${u.created_at}`);
    });

    // Смотрим отзывы
    console.log("\n💬 Отзывы:");
    const feedbacks = await mongoose.connection.db
      .collection("feedbacks")
      .find()
      .toArray();
    feedbacks.forEach((f) => {
      console.log(`  - [${f.subject}] ${f.message.substring(0, 50)}...`);
    });

    console.log("\n📊 Итого:");
    console.log(`  Пользователей: ${users.length}`);
    console.log(`  Отзывов: ${feedbacks.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Ошибка:", err.message);
    process.exit(1);
  }
}

checkDB();