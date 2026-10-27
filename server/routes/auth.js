const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const logAction = require("../utils/logAction");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, password_confirm, terms } = req.body;
    if (!terms) {
    return res.status(400).json({ error: "Необходимо согласие на обработку данных" });
    }
    if (!phone) {
      return res.status(400).json({ error: "Номер телефона обязателен" });
    }
    if (!name || !email || !password)
      return res.status(400).json({ error: "Все поля обязательны" });
    if (password.length < 8)
      return res.status(400).json({ error: "Пароль минимум 8 символов" });
    if (password !== password_confirm)
      return res.status(400).json({ error: "Пароли не совпадают" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email уже занят" });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, password_hash });

    req.session.userId = user._id;
    await logAction(user._id, "register");
    req.session.role = user.role;

    res.json({
      success: true,
      message: "Регистрация успешна",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email и пароль обязательны" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Неверный email или пароль" });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(400).json({ error: "Неверный email или пароль" });

    user.last_login = new Date();
    await user.save();

    req.session.userId = user._id;
    await logAction(user._id, "login");
    req.session.role = user.role;

    res.json({
      success: true,
      message: "Вход выполнен",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Ошибка выхода" });
    res.json({ success: true, message: "Выход выполнен" });
  });
});

router.get("/profile", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Не авторизован" });
  try {
    const user = await User.findById(req.session.userId).select("-password_hash");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});
// PUT /api/profile — обновление имени и email
router.put("/profile", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Не авторизован" });
  }
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Имя и email обязательны" });
    }
    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { name, email },
      { new: true }
    ).select("-password_hash");
    await logAction(req.session.userId, "update_profile");
    res.json({ success: true, message: "Профиль обновлён", user });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// PUT /api/password — смена пароля
router.put("/password", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Не авторизован" });
  }
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Заполните все поля" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Новый пароль минимум 8 символов" });
    }
    const user = await User.findById(req.session.userId);
    const isValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: "Старый пароль неверен" });
    }
    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();
    await logAction(req.session.userId, "change_password");
    res.json({ success: true, message: "Пароль успешно изменён" });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});
const UserAction = require("../models/UserAction");

// GET /api/my-actions — журнал действий для текущего пользователя
router.get("/my-actions", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Не авторизован" });
  try {
    // Берем последние 15 действий пользователя
    const actions = await UserAction.find({ user_id: req.session.userId })
      .sort({ created_at: -1 })
      .limit(15);
    res.json({ success: true, actions });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});
// GET /api/session-data — данные из сессии
router.get("/session-data", (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Не авторизован" });
  res.json({
    last_viewed: req.session.last_viewed || [],
    search_history: req.session.search_history || []
  });
});
module.exports = router;