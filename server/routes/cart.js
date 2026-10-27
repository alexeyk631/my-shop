const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const logAction = require("../utils/logAction");
const router = express.Router();

// Получить корзину текущего пользователя
router.get("/", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Не авторизован" });
  try {
    let cart = await Cart.findOne({ user_id: req.session.userId });
    if (!cart) {
      cart = await Cart.create({ user_id: req.session.userId, items: [] });
    }
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/add", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Не авторизован" });
  try {
    const { product_id } = req.body;
    const product = await Product.findById(product_id);
    if (!product) return res.status(404).json({ error: "Товар не найден" });

    let cart = await Cart.findOne({ user_id: req.session.userId });
    if (!cart) cart = new Cart({ user_id: req.session.userId, items: [] });

    const itemIndex = cart.items.findIndex(item => item.product_id.toString() === product_id);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({
        product_id: product._id,
        name: product.name,
        price: product.price,
        old_price: product.old_price || null, // <-- ДОБАВЛЕНА ЭТА СТРОКА
        image: product.image,
        quantity: 1
      });
    }

    await cart.save();
    await logAction(req.session.userId, "add_to_cart", product.name);
    res.json({ success: true, message: "Товар добавлен", cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});
// Изменить количество товара (увеличить/уменьшить)
router.put("/update", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Не авторизован" });
  try {
    const { product_id, action } = req.body; // action: 'increase' или 'decrease'
    const cart = await Cart.findOne({ user_id: req.session.userId });
    if (!cart) return res.status(404).json({ error: "Корзина не найдена" });

       const itemIndex = cart.items.findIndex(item => item.product_id.toString() === product_id);
    if (itemIndex > -1) {
      if (action === "increase") {
        if (cart.items[itemIndex].quantity >= 99) {
          return res.status(400).json({ error: "Максимум 99 штук" });
        }
        cart.items[itemIndex].quantity += 1;
      } else if (action === "decrease") {
        cart.items[itemIndex].quantity -= 1;
        if (cart.items[itemIndex].quantity <= 0) {
          cart.items.splice(itemIndex, 1);
        }
      } else if (action === "set") {
        // НОВЫЙ БЛОК: обработка ввода с клавиатуры
        const qty = Number(req.body.quantity);
        if (qty > 99) return res.status(400).json({ error: "Максимум 99 штук" });
        
        if (qty <= 0) {
          cart.items.splice(itemIndex, 1); // Если ввели 0 или меньше, удаляем
        } else {
          cart.items[itemIndex].quantity = qty;
        }
      }
      await cart.save();
      res.json({ success: true, cart });
        } else {
      res.status(404).json({ error: "Товар не найден в корзине" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});
// Удалить товар из корзины
router.delete("/:product_id", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Не авторизован" });
  try {
    const cart = await Cart.findOne({ user_id: req.session.userId });
    if (!cart) return res.status(404).json({ error: "Корзина не найдена" });

    cart.items = cart.items.filter(item => item.product_id.toString() !== req.params.product_id);
    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});
// POST /api/cart/view — запомнить просмотренный товар
router.post("/view", (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Не авторизован" });
  
  const { product_id } = req.body;
  if (!product_id) return res.status(400).json({ error: "Нет ID товара" });

  // Если массива еще нет, создаем
  if (!req.session.last_viewed) {
    req.session.last_viewed = [];
  }

  // Удаляем товар, если он уже был в истории, и добавляем в конец
  req.session.last_viewed = req.session.last_viewed.filter(id => id !== product_id);
  req.session.last_viewed.push(product_id);

  // Оставляем только последние 5 товаров
  if (req.session.last_viewed.length > 5) {
    req.session.last_viewed.shift(); 
  }

  res.json({ success: true });
});
module.exports = router;