/* ============================================
   1. MOBILE MENU
   ============================================ */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('active');
  hamburger.setAttribute('aria-expanded', hamburger.classList.contains('active'));
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
  });
});

/* ============================================
   2. NAVBAR SCROLL + BACK TO TOP
   ============================================ */
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
    backToTop.classList.add('show');
  } else {
    navbar.classList.remove('scrolled');
    backToTop.classList.remove('show');
  }
});

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ============================================
   3. SCROLL SPY
   ============================================ */
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 120) current = section.id;
  });
  navItems.forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
  });
});

/* ============================================
   4. SCROLL REVEAL
   ============================================ */
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('active'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealElements.forEach((el) => revealObserver.observe(el));

/* ============================================
   5. DARK MODE TOGGLE
   ============================================ */
const themeToggle = document.getElementById('themeToggle');
if (localStorage.getItem('foodie-theme') === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggle.textContent = '☀️';
}
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('foodie-theme', isDark ? 'dark' : 'light');
});

/* ============================================
   6. MENU FILTER
   ============================================ */
const filterBtns = document.querySelectorAll('.filter-btn');
const menuCards = document.querySelectorAll('.menu-card');

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    menuCards.forEach((card) => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.classList.remove('hidden');
        card.style.animation = 'fadeIn 0.4s ease';
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

/* ============================================
   7. SHOPPING CART
   ============================================ */
let cart = JSON.parse(localStorage.getItem('foodie-cart')) || [];

const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartBtn = document.getElementById('cartBtn');
const cartClose = document.getElementById('cartClose');
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const toast = document.getElementById('toast');

function openCart() {
  cartSidebar.classList.add('active');
  cartOverlay.classList.add('active');
}
function closeCart() {
  cartSidebar.classList.remove('active');
  cartOverlay.classList.remove('active');
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function saveCart() {
  localStorage.setItem('foodie-cart', JSON.stringify(cart));
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCountEl.textContent = totalItems;
  cartCountEl.classList.add('bump');
  setTimeout(() => cartCountEl.classList.remove('bump'), 300);
}

function renderCart() {
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="empty-cart">Your cart is empty 😢</p>';
    cartTotalEl.textContent = '₹0';
    return;
  }

  cartItemsEl.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <span>₹${item.price} × ${item.qty} = ₹${item.price * item.qty}</span>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" data-action="dec" data-idx="${idx}">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" data-action="inc" data-idx="${idx}">+</button>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartTotalEl.textContent = `₹${total}`;

  // Attach qty handlers
  cartItemsEl.querySelectorAll('.qty-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = +btn.dataset.idx;
      if (btn.dataset.action === 'inc') {
        cart[idx].qty++;
      } else {
        cart[idx].qty--;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
      }
      saveCart();
      renderCart();
      updateCartCount();
    });
  });
}

// Add to cart buttons
document.querySelectorAll('.btn-add').forEach((btn) => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.name;
    const price = +btn.dataset.price;

    const existing = cart.find((item) => item.name === name);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ name, price, qty: 1 });
    }

    saveCart();
    renderCart();
    updateCartCount();
    showToast(`✅ ${name} added to cart!`);
  });
});

// Checkout
checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    showToast('🛒 Cart is empty!');
    return;
  }
  showToast(`🎉 Order placed! Total: ₹${cart.reduce((s, i) => s + i.price * i.qty, 0)}`);
  cart = [];
  saveCart();
  renderCart();
  updateCartCount();
  closeCart();
});

// Initialize cart on load
renderCart();
updateCartCount();

/* ============================================
   8. FADE-IN KEYFRAMES (for filter animation)
   ============================================ */
const style = document.createElement('style');
style.textContent = `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);