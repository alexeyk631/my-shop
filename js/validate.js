// 1. Проверка длины пароля
function isValidPassword(password) {
  if (typeof password !== 'string') return false;
  return password.length >= 8;
}

// 2. Проверка совпадения паролей
function doPasswordsMatch(pass, confirmPass) {
  return pass === confirmPass;
}

// 3. Проверка email
function validateEmail(email) {
  if (typeof email !== 'string' || email.length === 0) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// 4. Бизнес-логика: расчет стоимости корзины
function calculateCartTotal(items) {
  if (!Array.isArray(items) || items.length === 0) return 0;
  
  return items.reduce((total, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return total + (price * quantity);
  }, 0);
}

// Экспортируем для Node.js (для тестов)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { isValidPassword, doPasswordsMatch, validateEmail, calculateCartTotal };
}