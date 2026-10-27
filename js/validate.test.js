import { describe, it, expect } from 'vitest';
const { isValidPassword, doPasswordsMatch, validateEmail, calculateCartTotal } = require('./validate.js');

describe('Модуль валидации (Email)', () => {
  it('принимает корректный адрес', () => {
    expect(validateEmail('student@example.com')).toBe(true);
  });
  it('отклоняет адрес без @', () => {
    expect(validateEmail('student.example.com')).toBe(false);
  });
  it('отклоняет пустую строку', () => {
    expect(validateEmail('')).toBe(false);
  });
  it('отклоняет не-строку', () => {
    expect(validateEmail(12345)).toBe(false);
  });
});

describe('Модуль валидации (Пароли)', () => {
  it('принимает пароль длиной 8 и более символов', () => {
    expect(isValidPassword('12345678')).toBe(true);
  });
  it('отклоняет короткий пароль', () => {
    expect(isValidPassword('123')).toBe(false);
  });
  it('проверяет совпадение паролей', () => {
    expect(doPasswordsMatch('12345678', '12345678')).toBe(true);
    expect(doPasswordsMatch('12345678', '87654321')).toBe(false);
  });
});

describe('Бизнес-логика (Расчет корзины)', () => {
  it('возвращает 0 для пустой корзины', () => {
    expect(calculateCartTotal([])).toBe(0);
    expect(calculateCartTotal(null)).toBe(0);
  });
  it('правильно считает сумму двух товаров', () => {
    const cart = [
      { price: 1000, quantity: 2 }, // 2000
      { price: 500, quantity: 1 }   // 500
    ];
    expect(calculateCartTotal(cart)).toBe(2500);
  });
  it('корректно обрабатывает строковые цены', () => {
    const cart = [{ price: "1500", quantity: "2" }]; // 3000
    expect(calculateCartTotal(cart)).toBe(3000);
  });
});