const express = require("express");
const UserAction = require("../models/UserAction");
const User = require("../models/User");
const Product = require("../models/Product");
const Feedback = require("../models/Feedback");
const Order = require("../models/Order");
const router = express.Router();

// Мидлвар: только для админа
async function requireAdmin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: "Не авторизован" });
  const user = await User.findById(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Доступ только для администратора" });
  }
  next();
}

// GET /api/admin/actions — журнал действий всех пользователей
router.get("/actions", requireAdmin, async (req, res) => {
  try {
    const actions = await UserAction.find()
      .populate("user_id", "name email")
      .sort({ created_at: -1 })
      .limit(100);
    res.json({ success: true, actions });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// GET /api/admin/users — список пользователей
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password_hash").sort({ created_at: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// DELETE /api/admin/products/:id — удалить товар
router.delete("/products/:id", requireAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Товар удалён" });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});
// GET /api/admin/products — список товаров для админки
router.get("/products", requireAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// GET /api/admin/feedbacks — список всех отзывов
router.get("/feedbacks", requireAdmin, async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("user_id", "name email")
      .sort({ created_at: -1 });
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// PUT /api/admin/feedbacks/:id — изменить статус отзыва
router.put("/feedbacks/:id", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["new", "in_progress", "resolved"].includes(status)) {
      return res.status(400).json({ error: "Неверный статус" });
    }
    await Feedback.findByIdAndUpdate(req.params.id, { status });
    res.json({ success: true, message: "Статус обновлён" });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /api/admin/products — добавить товар
router.post("/products", requireAdmin, async (req, res) => {
  try {
    const { name, price, description, image, category, old_price } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: "Название и цена обязательны" });
    }
    const product = await Product.create({
      name,
      price: Number(price),
      old_price: old_price ? Number(old_price) : null, // <-- Добавь для скидки
      short_description: description || "",
      description: description || "",
      image: image || "https://via.placeholder.com/300",
      category: category || "Разное", // <-- Вот здесь используется переменная
      available: true,
    });
    res.json({ success: true, message: "Товар добавлен", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});
// PUT /api/admin/products/:id — редактировать товар
// PUT /api/admin/products/:id — редактировать товар
router.put("/products/:id", requireAdmin, async (req, res) => {
  try {
    const { name, price, image, category, old_price } = req.body; // <-- old_price здесь
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        price: Number(price), 
        old_price: old_price ? Number(old_price) : null, // <-- и здесь
        image, 
        category 
      },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Товар не найден" });
    res.json({ success: true, message: "Товар обновлён", product });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});
// GET /api/admin/orders — все заказы
router.get("/orders", requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user_id", "name email")
      .sort({ created_at: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});
// PUT /api/admin/orders/:id — изменить статус заказа
router.put("/orders/:id", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    // Проверяем, что статус из допустимого списка
    if (!["В обработке", "Отправлен", "Доставлен"].includes(status)) {
      return res.status(400).json({ error: "Неверный статус" });
    }
    await Order.findByIdAndUpdate(req.params.id, { status });
    res.json({ success: true, message: "Статус обновлён" });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});
// PUT /api/admin/users/:id — изменить роль пользователя
router.put("/users/:id", requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Неверная роль" });
    }
    
    // Запрещаем админу разжаловать самого себя (чтобы не потерять доступ)
    if (req.params.id === req.session.userId.toString()) {
      return res.status(400).json({ error: "Вы не можете изменить свою собственную роль" });
    }

    await User.findByIdAndUpdate(req.params.id, { role });
    res.json({ success: true, message: "Роль обновлена" });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// DELETE /api/admin/users/:id — удалить пользователя
router.delete("/users/:id", requireAdmin, async (req, res) => {
  try {
    if (req.params.id === req.session.userId.toString()) {
      return res.status(400).json({ error: "Вы не можете удалить самого себя" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Пользователь удален" });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});
module.exports = router;