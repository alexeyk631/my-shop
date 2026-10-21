async function loadCatalog() {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;

  try {
    const res = await fetch("/api/search/all");
    const data = await res.json();

    if (data.success && data.products.length > 0) {
      // Группируем товары по категориям
      const categories = {};
      data.products.forEach(p => {
        const cat = p.category || "Разное";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(p);
      });

      // Выводим каждую категорию как отдельную секцию
      grid.innerHTML = Object.keys(categories).map(catName => `
        <section class="category" style="grid-column: 1 / -1;">
          <h2 class="category__title">${catName}</h2>
          <div class="category__grid">
            ${categories[catName].map(p => `
              <article class="product-card">
                <img src="${p.image || 'https://via.placeholder.com/300x400'}" alt="${p.name}" class="product-card__image">
                <h3 class="product-card__title">${p.name}</h3>
                <p class="product-card__price">
                  ${p.old_price ? `<span style="text-decoration: line-through; color: #9ca3af; font-size: 0.85em; margin-right: 5px;">${p.old_price} ₽</span>` : ''}
                  <span>${p.price} ₽</span>
                </p>
                <button type="button" class="product-card__button button button_theme_primary" onclick="addToCartCatalog('${p._id}')">В корзину</button>
              </article>
            `).join("")}
          </div>
        </section>
      `).join("");
      
    } else {
      grid.innerHTML = "<p style='text-align:center;'>Товаров пока нет.</p>";
    }
  } catch (err) {
    console.error(err);
  }
}

// Добавление в корзину прямо из каталога
// Добавление в корзину прямо из каталога
window.addToCartCatalog = async function(productId) {
  // --- ДОБАВЛЕННЫЙ КОД ---
  // Запоминаем товар в сессии (просмотренные)
  try {
    await fetch("/api/cart/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ product_id: productId })
    });
  } catch (e) {
    console.log("Не удалось сохранить просмотр", e);
  }
  // --- КОНЕЦ ДОБАВЛЕННОГО КОДА ---

  try {
    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ product_id: productId })
    });
    const data = await res.json();
    if (data.success) alert("✅ Товар добавлен в корзину!");
    else alert("❌ Ошибка: " + data.error + ". Вы авторизованы?");
  } catch (err) {
    console.error(err);
  }
};

loadCatalog();