const UserAction = require("../models/UserAction");

async function logAction(userId, action, details = "") {
  try {
    if (!userId) return;
    await UserAction.create({ user_id: userId, action, details });
  } catch (err) {
    console.error("Ошибка записи действия:", err.message);
  }
}

module.exports = logAction;