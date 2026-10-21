// Проверка авторизации и загрузка данных
async function loadProfile() {
  try {
    const res = await fetch("/api/profile", { credentials: "include" });
    if (!res.ok) {
      alert("Вы не авторизованы. Перенаправление на страницу контактов.");
      window.location.href = "/contacts.html";
      return;
    }
    const data = await res.json();
    
    // Заполняем форму
    document.getElementById("profile-name").value = data.user.name;
    document.getElementById("profile-email").value = data.user.email;
  } catch (err) {
    console.error(err);
  }
}

// Загрузка отзывов
async function loadFeedbacks() {
  try {
    const res = await fetch("/api/feedback/my", { credentials: "include" });
    const data = await res.json();
    const container = document.getElementById("my-feedbacks");
    
    if (data.feedbacks && data.feedbacks.length > 0) {
      container.innerHTML = data.feedbacks.map(f => `
        <div style="border-bottom: 1px solid #e5e7eb; padding: 1rem 0;">
          <strong>${f.subject}</strong>
          <p style="font-size: 0.9rem; color: #4b5563; margin-top: 0.5rem;">${f.message}</p>
          <span style="font-size: 0.8rem; color: #9ca3af;">${new Date(f.created_at).toLocaleString()}</span>
        </div>
      `).join("");
    } else {
      container.innerHTML = "<p>У вас пока нет отзывов.</p>";
    }
  } catch (err) {
    console.error(err);
  }
}

// Сохранение профиля
document.getElementById("profile-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("profile-name").value;
  const email = document.getElementById("profile-email").value;
  
  const res = await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email })
  });
  const data = await res.json();
  if (data.success) alert("✅ Профиль обновлён!");
  else alert("❌ " + data.error);
});

// Смена пароля
document.getElementById("password-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const oldPassword = document.getElementById("old-password").value;
  const newPassword = document.getElementById("new-password").value;
  
  const res = await fetch("/api/password", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ oldPassword, newPassword })
  });
  const data = await res.json();
  if (data.success) {
    alert("✅ Пароль изменён!");
    document.getElementById("password-form").reset();
  } else alert("❌ " + data.error);
});

// Выход
document.getElementById("logout-btn").addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST", credentials: "include" });
  window.location.href = "/contacts.html";
});
// Скрываем кнопку "Регистрация" для авторизованных пользователей
(async function hideRegisterLink() {
  try {
    const res = await fetch("/api/profile", { credentials: "include" });
    if (res.ok) {
      // Если пользователь авторизован (сервер вернул 200)
      const regLink = document.querySelector('a[href="register.html"]');
      if (regLink) {
        regLink.parentElement.style.display = "none"; // Скрываем ссылку
      }
    }
  } catch (err) {
    console.error(err);
  }
})();
// Добавление ссылки на Админку для администраторов
(async function initAdminLink() {
  try {
    const res = await fetch("/api/profile", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      // Если пользователь — админ, добавляем ссылку в меню
      if (data.user && data.user.role === "admin") {
        const navList = document.querySelector('.nav__list');
        // Проверяем, нет ли уже такой ссылки, чтобы не дублировать
        if (navList && !document.querySelector('a[href="admin.html"]')) {
          const li = document.createElement('li');
          li.className = 'nav__item';
          li.innerHTML = '<a href="admin.html" class="nav__link" style="color: #dc2626; font-weight: bold;">Админ-панель</a>';
          navList.appendChild(li);
        }
      }
    }
  } catch (err) {
    console.error("Ошибка проверки роли:", err);
  }
})();
// Инициализация
// Загрузка заказов
async function loadOrders() {
  try {
    const res = await fetch("/api/orders/my", { credentials: "include" });
    const data = await res.json();
    const container = document.getElementById("my-orders");
    
    if (data.orders && data.orders.length > 0) {
      container.innerHTML = data.orders.map(o => `
        <div style="border-bottom: 1px solid #e5e7eb; padding: 1rem 0;">
          <div style="display: flex; justify-content: space-between;">
            <strong>Заказ от ${new Date(o.created_at).toLocaleDateString()}</strong>
            <span>${o.total} ₽</span>
          </div>
          <ul style="font-size: 0.9rem; color: #4b5563; margin-top: 0.5rem;">
            ${o.items.map(i => `<li>${i.name} × ${i.quantity}</li>`).join("")}
          </ul>
          <span style="font-size: 0.8rem; color: #16a34a;">Статус: ${o.status}</span>
        </div>
      `).join("");
    } else {
      container.innerHTML = "<p>У вас пока нет заказов.</p>";
    }
  } catch (err) {
    console.error(err);
  }
}
// Загрузка истории активности
async function loadMyActions() {
  try {
    const res = await fetch("/api/my-actions", { credentials: "include" });
    const data = await res.json();
    const container = document.getElementById("my-actions-list");
    
    if (data.actions && data.actions.length > 0) {
      container.innerHTML = data.actions.map(a => {
        // Делаем названия действий красивее
        let actionName = a.action;
        if (a.action === "login") actionName = "Вход в аккаунт";
        if (a.action === "add_feedback") actionName = "Отправлен отзыв";
        if (a.action === "add_to_cart") actionName = "Товар добавлен в корзину";
        if (a.action === "update_profile") actionName = "Обновлен профиль";
        if (a.action === "change_password") actionName = "Изменен пароль";

        return `
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding: 0.75rem 0; font-size: 0.9rem;">
            <span><strong>${actionName}</strong> ${a.details ? '(' + a.details + ')' : ''}</span>
            <span style="color: #9ca3af;">${new Date(a.created_at).toLocaleString()}</span>
          </div>
        `;
      }).join("");
    } else {
      container.innerHTML = "<p>История действий пуста.</p>";
    }
  } catch (err) {
    console.error(err);
  }
}
async function loadSessionData() {
  try {
    const res = await fetch("/api/session-data", { credentials: "include" });
    const data = await res.json();
    
    document.getElementById("session-search").innerText = 
      data.search_history.length > 0 ? data.search_history.join(", ") : "пусто";
      
    document.getElementById("session-viewed").innerText = 
      data.last_viewed.length > 0 ? data.last_viewed.join(", ") : "пусто";
  } catch (err) { console.error(err); }
}

loadSessionData();

// Вызов
loadMyActions();
// Вызов при загрузке страницы
loadOrders();
loadProfile();
loadFeedbacks();