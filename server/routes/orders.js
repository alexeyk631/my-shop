const express = require("express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");

const router = express.Router();

// POST /api/orders — оформить заказ
router.post("/", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Не авторизован" });
  try {
    const cart = await Cart.findOne({ user_id: req.session.userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Корзина пуста" });
    }

    // Считаем сумму
    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Создаем заказ
    const order = await Order.create({
      user_id: req.session.userId,
      items: cart.items,
      total: total
    });

    // Очищаем корзину
    cart.items = [];
    await cart.save();

    res.json({ success: true, message: "Заказ оформлен!", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// GET /api/orders/my — мои заказы
router.get("/my", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Не авторизован" });
  try {
    const orders = await Order.find({ user_id: req.session.userId }).sort({ created_at: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;