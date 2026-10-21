const express = require("express");
const Product = require("../models/Product");

const router = express.Router();
// GET /api/products — получить все товары (для каталога)
router.get("/all", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2)
      return res.status(400).json({ error: "Введите минимум 2 символа" });
    // Внутри router.get("/", ...) после проверки q:
    if (req.session.userId && q.trim().length >= 2) {
      if (!req.session.search_history) req.session.search_history = [];
      
      // Удаляем дубликат, если он есть
      req.session.search_history = req.session.search_history.filter(item => item !== q);
      req.session.search_history.push(q);

      // Оставляем только 5 последних запросов
      if (req.session.search_history.length > 5) {
        req.session.search_history.shift();
      }
    }
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { short_description: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    }).limit(20);

    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;