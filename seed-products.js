const mongoose = require("mongoose");
const Product = require("./server/models/Product");

// Подключаемся к твоей локальной базе
const MONGO_URI = "mongodb://127.0.0.1:27017/products_db";

const products = [
  {
    name: "Футболка Oversize",
    alias: "tshirt-oversize",
    short_description: "Свободная футболка из хлопка",
    description: "Мягкая хлопковая футболка свободного кроя. Идеально подходит для повседневного образа.",
    price: 1990,
    image: "https://ir.ozone.ru/s3/multimedia-1-z/13175355851.jpg",
    available: true,
    meta_title: "Футболка Oversize — StyleShop",
  },
  {
    name: "Футболка Basic",
    alias: "tshirt-basic",
    short_description: "Классическая белая футболка",
    description: "Базовая футболка из 100% хлопка. Подходит под любой образ.",
    price: 1490,
    image: "https://basket-36.wbbasket.ru/vol7819/part781970/781970889/images/big/1.webp",
    available: true,
    meta_title: "Футболка Basic — StyleShop",
  },
  {
    name: "Футболка с принтом",
    alias: "tshirt-print",
    short_description: "Футболка с ярким принтом",
    description: "Футболка с авторским принтом. Отличный вариант для тех, кто любит выделяться.",
    price: 1790,
    image: "https://basket-42.wbbasket.ru/vol10881/part1088105/1088105435/images/c246x328/8.webp",
    available: true,
  },
  {
    name: "Джинсы Slim",
    alias: "jeans-slim",
    short_description: "Зауженные синие джинсы",
    description: "Классические джинсы Slim Fit. Плотный деним, удобная посадка.",
    price: 3490,
    image: "https://ir.ozone.ru/s3/multimedia-1-b/12549788867.jpg",
    available: true,
  },
  {
    name: "Джинсы Mom",
    alias: "jeans-mom",
    short_description: "Джинсы Mom Fit",
    description: "Джинсы Mom Fit с высокой посадкой. Голубой деним.",
    price: 3990,
    image: "https://basket-03.wbbasket.ru/vol397/part39739/39739771/images/big/1.webp",
    available: true,
  },
  {
    name: "Куртка демисезонная",
    alias: "jacket-demi",
    short_description: "Куртка демисезонная бежевая",
    description: "Стильная куртка на прохладную погоду.",
    price: 7990,
    image: "https://basket-32.wbbasket.ru/vol6461/part646127/646127198/images/big/1.webp",
    available: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Подключено к MongoDB");

    await Product.deleteMany({});
    console.log("🗑️  Старые товары удалены");

    const created = await Product.insertMany(products);
    console.log(`✅ Добавлено товаров: ${created.length}`);

    created.forEach((p) => console.log(`  - ${p.name} — ${p.price} ₽`));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Ошибка:", err.message);
    process.exit(1);
  }
}

seed();