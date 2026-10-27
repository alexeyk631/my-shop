async function loadCart() {
  try {
    const res = await fetch("/api/cart", { credentials: "include" });
    if (!res.ok) {
      window.location.href = "/login.html";
      return;
    }
    const data = await res.json();
    const tbody = document.querySelector(".cart__table tbody");
    const totalEl = document.querySelector(".cart__total-value");
    
    if (data.cart.items.length === 0) {
      tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding: 2rem;'>Корзина пуста</td></tr>";
      totalEl.innerText = "0 ₽";
      return;
    }

    let total = 0;
    let oldTotal = 0;

    tbody.innerHTML = data.cart.items.map(item => {
      total += item.price * item.quantity;
      
      if (item.old_price) {
        oldTotal += item.old_price * item.quantity;
      }

      // ПРОВЕРКА НА УДАЛЕННЫЙ ТОВАР
      if (!item.name || !item.image) {
        return ""; 
      }

      const priceHTML = item.old_price 
        ? `<span style="text-decoration: line-through; color: #9ca3af; font-size: 0.85em; margin-right: 5px;">${item.old_price} ₽</span> 
           <span style="color: #dc2626; font-weight: bold;">${item.price} ₽</span>`
        : `${item.price} ₽`;

      return `
        <tr>
          <td data-label="Товар">
            <div style="display:flex; align-items:center; gap:10px;">
               <img src="${item.image}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;">
               ${item.name}
            </div>
          </td>
          <td data-label="Размер">-</td>
          <td data-label="Цена">${priceHTML}</td>
                    <td data-label="Кол-во">
            <div style="display: flex; align-items: center; gap: 5px;">
              <button class="btn-qty" onclick="updateQty('${item.product_id}', 'decrease')">-</button>
              
              <!-- Поле для ручного ввода -->
              <input type="number" class="qty-input" value="${item.quantity}" min="1" max="99" 
                     onchange="setQty('${item.product_id}', this.value)" style="width: 45px; text-align: center; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
              
              <button class="btn-qty" onclick="updateQty('${item.product_id}', 'increase')">+</button>
            </div>
          </td>
          <td data-label="Сумма">${(item.price * item.quantity).toLocaleString('ru-RU')} ₽</td>
          <td style="text-align: center; border: none;">
            <button class="btn-delete" onclick="deleteItem('${item.product_id}')">✖</button>
          </td>
        </tr>
      `;
    }).join("");

    if (oldTotal > total) {
      const discount = oldTotal - total;
      totalEl.innerHTML = `
        <div style="font-size: 0.8em; color: #6b7280; font-weight: normal; text-decoration: line-through;">Старая цена: ${oldTotal.toLocaleString('ru-RU')} ₽</div>
        <div style="font-size: 1.2em; color: #111;">Итого: ${total.toLocaleString('ru-RU')} ₽</div>
        <div style="font-size: 0.8em; color: #16a34a; font-weight: normal;">Ваша скидка: ${discount.toLocaleString('ru-RU')} ₽</div>
      `;
    } else {
      totalEl.innerText = total.toLocaleString('ru-RU') + " ₽";
    }
  } catch (err) {
    console.error(err);
  }
}

// Удаление товара
async function deleteItem(productId) {
  try {
    const res = await fetch(`/api/cart/${productId}`, {
      method: "DELETE",
      credentials: "include"
    });
    if (res.ok) loadCart();
  } catch (err) { console.error(err); }
}

// Изменение количества
async function updateQty(productId, action) {
  try {
    const res = await fetch("/api/cart/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ product_id: productId, action })
    });
    if (res.ok) loadCart();
    else {
      const err = await res.json();
      alert("Ошибка: " + err.error);
    }
  } catch (err) { console.error(err); }
}

// Оформление заказа
window.checkout = async function() {
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      credentials: "include"
    });
    const data = await res.json();
    if (data.success) {
      alert("✅ Заказ оформлен! Сумма: " + data.order.total + " ₽");
      loadCart();
    } else {
      alert("❌ Ошибка: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Ошибка соединения");
  }
};
// Установка точного количества из поля ввода
async function setQty(productId, newQuantity) {
  try {
    const res = await fetch("/api/cart/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ 
        product_id: productId, 
        action: "set", 
        quantity: Number(newQuantity) // передаем само число
      })
    });
    
    if (res.ok) {
      loadCart(); // Перерисовываем корзину, чтобы обновить итоговую сумму
    } else {
      const data = await res.json();
      alert("Ошибка: " + data.error);
      loadCart(); // Если ошибка (например, больше 99), возвращаем как было
    }
  } catch (err) {
    console.error(err);
  }
}
loadCart();