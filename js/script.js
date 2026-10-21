/* ==========================================
   1. БУРГЕР-МЕНЮ
   ========================================== */
   (function initBurger() {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav__list');
  
    if (!burger || !nav) return;
  
    burger.addEventListener('click', () => {
      const isExpanded = burger.getAttribute('aria-expanded') === 'true';
      const next = !isExpanded;
  
      nav.classList.toggle('active', next);
      burger.setAttribute('aria-expanded', String(next));
      burger.setAttribute('aria-label', next ? 'Закрыть меню' : 'Открыть меню');
    });
  
    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('active')) {
        nav.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Открыть меню');
        burger.focus();
      }
    });
  
    // Закрытие при клике вне меню
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('active')) return;
      if (nav.contains(e.target) || burger.contains(e.target)) return;
  
      nav.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Открыть меню');
    });
  })();
  
  
  /* ==========================================
     2. ПРОВЕРКА СОВПАДЕНИЯ ПАРОЛЕЙ
     ========================================== */
  (function initPasswordCheck() {
    const form = document.querySelector('.form_registration');
    if (!form) return;
  
    const password = form.querySelector('input[name="password"]');
    const confirm = form.querySelector('input[name="password_confirm"]');
  
    if (!password || !confirm) return;
  
    function checkMatch() {
      if (!confirm.value) {
        confirm.setCustomValidity('');
        return true;
      }
  
      if (password.value !== confirm.value) {
        confirm.setCustomValidity('Пароли не совпадают');
        return false;
      }
  
      confirm.setCustomValidity('');
      return true;
    }
  
    password.addEventListener('input', checkMatch);
    confirm.addEventListener('input', checkMatch);
  
    form.addEventListener('submit', (e) => {
      if (!checkMatch()) {
        e.preventDefault();
        confirm.reportValidity();
      }
    });
  })();
  
  
/* ==========================================
   6. КОРЗИНА (Работа с БД)
   ========================================== */
(function initCartDB() {
  const buttons = document.querySelectorAll(".product-card__button");
  
  buttons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      // Находим карточку товара и берем название (в идеале лучше брать ID, но для лабы сойдет поиск по имени)
      const card = btn.closest(".product-card");
      const productName = card.querySelector(".product-card__title").innerText;
      
      try {
        // Сначала найдем товар по имени, чтобы получить его ID (так как в HTML у нас нет data-id)
        const searchRes = await fetch("/api/search?q=" + encodeURIComponent(productName));
        const searchData = await searchRes.json();
        
        if (searchData.success && searchData.products.length > 0) {
          const productId = searchData.products[0]._id;
          
          const res = await fetch("/api/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ product_id: productId })
          });
          const data = await res.json();

          if (data.success) {
            const originalText = btn.textContent;
            btn.textContent = '✓ В корзине';
            btn.disabled = true;
            setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 1500);
          } else {
            alert("Ошибка: " + data.error + ". Вы авторизованы?");
          }
        }
      } catch (err) {
        console.error(err);
        alert("Ошибка соединения с сервером");
      }
    });
  });
})();
/* ==========================================
   4. ОТПРАВКА ФОРМ НА СЕРВЕР (API)
   ========================================== */

// -------- Регистрация --------
// -------- Регистрация --------
(function initRegisterForm() {
  const form = document.querySelector(".form_registration");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.querySelector('input[name="username"]').value;
    const email = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;
    const password_confirm = form.querySelector('input[name="password_confirm"]').value;
    
    // Проверка галочки
    const terms = form.querySelector('input[name="terms"]');
    if (!terms || !terms.checked) {
      alert("❌ Пожалуйста, согласитесь на обработку персональных данных.");
      return; 
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, password_confirm, terms: terms.checked }),
      });
      const data = await res.json();

      if (data.success) {
        alert("✅ Регистрация успешна! Добро пожаловать, " + data.user.name);
        window.location.href = "/index.html";
      } else {
        alert("❌ Ошибка: " + data.error);
      }
    } catch (err) {
      alert("❌ Ошибка соединения с сервером");
      console.error(err);
    }
  });
})();


// -------- Вход --------
(function initLoginForm() {
  const form = document.querySelector(".form_login");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Вот этих строк не хватало!
    const email = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        alert("✅ Вход выполнен! Привет, " + data.user.name);
        window.location.href = "/index.html"; 
      } else {
        alert("❌ Ошибка: " + data.error);
      }
    } catch (err) {
      alert("❌ Ошибка соединения с сервером");
      console.error(err);
    }
  });
})();


// -------- Обратная связь (отзывы) --------
(function initFeedbackForm() {
  const form = document.querySelector(".form_feedback");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const subjectEl = form.querySelector('select[name="subject"]');
    const messageEl = form.querySelector('textarea[name="message"]');
    const ratingEl = form.querySelector('select[name="rating"]');
    const privacyEl = form.querySelector('input[name="privacy"]');

    if (!subjectEl || !messageEl || !privacyEl) return;

    const subject = subjectEl.value;
    const message = messageEl.value;
    const rating = ratingEl ? ratingEl.value : null;

    if (!privacyEl.checked) {
      alert("❌ Пожалуйста, согласитесь на обработку персональных данных.");
      return;
    }

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subject, message, rating }),
      });
      const data = await res.json();

      if (data.success) {
        alert("✅ Отзыв отправлен!");
        form.reset();
      } else {
        alert("❌ Ошибка: " + data.error);
      }
    } catch (err) {
      alert("❌ Ошибка соединения с сервером");
      console.error(err);
    }
  });
})();


// -------- Поиск --------
(function initSearch() {
  const input = document.querySelector("#search-input");
  const results = document.querySelector("#search-results");
  if (!input || !results) return;

  let timer;

  input.addEventListener("input", () => {
    clearTimeout(timer);
    const q = input.value.trim();

    if (q.length < 2) {
      results.innerHTML = "";
      return;
    }

    timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/search?q=" + encodeURIComponent(q));
        const data = await res.json();

        if (data.success && data.products.length > 0) {
          results.innerHTML = data.products
            .map(
              (p) => `
              <div class="search-result" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong>${p.name}</strong> — ${p.price} ₽
                </div>
                <button class="button button_theme_primary button_size_s" onclick="addToCartFromSearch('${p._id}')" style="padding: 5px 10px; font-size: 0.8rem;">
                  В корзину
                </button>
              </div>
            `
            )
            .join("");
        } else {
          results.innerHTML = "<div class='search-result'>Ничего не найдено</div>";
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);
  });
})();

// Глобальная функция для добавления в корзину из поиска
window.addToCartFromSearch = async function(productId) {
  try {
    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ product_id: productId })
    });
    const data = await res.json();

    if (data.success) {
      alert("✅ Товар добавлен в корзину!");
    } else {
      alert("❌ Ошибка: " + data.error + ". Возможно, вы не авторизованы.");
    }
  } catch (err) {
    console.error(err);
    alert("❌ Ошибка соединения с сервером");
  }
};
/* ==========================================
   5. СЛАЙДЕР НА ГЛАВНОЙ
   ========================================== */
(function initSlider() {
  const slides = document.querySelectorAll(".slider .item");
  if (slides.length === 0) return; // Если слайдера нет на странице — выходим

  let slideIndex = 0;

  function showSlides(n) {
    // Если дошли до конца — начинаем сначала
    if (n >= slides.length) slideIndex = 0;
    // Если ушли в минус — переходим в конец
    if (n < 0) slideIndex = slides.length - 1;

    // Скрываем все слайды
    slides.forEach((slide) => slide.classList.remove("active"));
    
    // Показываем текущий
    slides[slideIndex].classList.add("active");
  }

  // Делаем функцию доступной глобально для кнопок onclick
  window.nextSlide = function(n) {
    showSlides(slideIndex += n);
  };

  // Запускаем первый слайд при загрузке страницы
  showSlides(slideIndex);
})();

// ==========================================
// 7. УМНОЕ МЕНЮ (Проверка авторизации и роли)
// ==========================================
(async function initSmartMenu() {
  try {
    const res = await fetch("/api/profile", { credentials: "include" });
    const isAuth = res.ok; // 200 = авторизован
    
    const regLink = document.querySelector('a[href="register.html"]');
    const profileLink = document.querySelector('a[href="profile.html"]');
    
    if (isAuth) {
      // Если авторизован — скрываем "Регистрация"
      if (regLink) regLink.parentElement.style.display = "none";
      
      // Проверяем роль
      const data = await res.json();
      
      if (data.user && data.user.role === "admin") {
        // Если админ — создаем ссылку на админку, если её нет
        let adminLink = document.querySelector('a[href="admin.html"]');
        if (!adminLink) {
          const navList = document.querySelector('.nav__list');
          if (navList) {
            const li = document.createElement('li');
            li.className = 'nav__item';
            li.innerHTML = '<a href="admin.html" class="nav__link" style="color: #dc2626; font-weight: bold;">Админ-панель</a>';
            navList.appendChild(li);
          }
        }
      }
    } else {
      // Если НЕ авторизован — скрываем "Кабинет"
      if (profileLink) profileLink.parentElement.style.display = "none";
    }
  } catch (err) {
    console.log("Меню: пользователь не авторизован");
  }
})();