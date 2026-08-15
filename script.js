/* =========================================================================
   ISLE OF SCENTS — script.js
   Handles: product rendering, cart state, slide-out drawer, demo checkout,
   scroll reveal, sticky nav, mobile menu, hero mist canvas, preloader.
   All data below is placeholder — swap PRODUCTS and images for the real
   Isle of Scents catalogue when going live.
   ========================================================================= */

(() => {
  'use strict';

  /* ---------------------------------------------------------------------
     1. PRODUCT DATA (placeholder catalogue — replace with real SKUs)
     --------------------------------------------------------------------- */
  const PRODUCTS = [
    {
      id: 'p1',
      name: 'Amber Isle',
      notes: 'Amber · Sandalwood · Vanilla Musk',
      price: 68000,
      tag: 'Signature',
      img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=900&auto=format&fit=crop'
    },
    {
      id: 'p2',
      name: 'Coral Musk',
      notes: 'Sea Salt · White Musk · Cedar',
      price: 59500,
      tag: 'New',
      img: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=900&auto=format&fit=crop'
    },
    {
      id: 'p3',
      name: 'Velvet Noir',
      notes: 'Black Orchid · Oud · Dark Rum',
      price: 74000,
      tag: 'Best Seller',
      img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=900&auto=format&fit=crop'
    },
    {
      id: 'p4',
      name: 'Golden Reef',
      notes: 'Bergamot · Saffron · Amberwood',
      price: 63000,
      tag: 'Limited',
      img: 'https://images.unsplash.com/photo-1615368144592-04a1a2b8f2a1?q=80&w=900&auto=format&fit=crop'
    },
    {
      id: 'p5',
      name: 'Driftwood Rose',
      notes: 'Turkish Rose · Driftwood · Amber',
      price: 71500,
      tag: 'Best Seller',
      img: 'https://images.unsplash.com/photo-1610461888750-10bfc601b874?q=80&w=900&auto=format&fit=crop'
    },
    {
      id: 'p6',
      name: 'Isle Blanc',
      notes: 'White Tea · Jasmine · Soft Musk',
      price: 56000,
      tag: 'New',
      img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=900&auto=format&fit=crop'
    }
  ];

  const BESTSELLER_IDS = ['p3', 'p5', 'p1'];

  const NGN = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  });

  /* ---------------------------------------------------------------------
     2. STATE
     --------------------------------------------------------------------- */
  let cart = []; // [{ id, qty }]

  const getProduct = (id) => PRODUCTS.find((p) => p.id === id);

  const cartTotal = () =>
    cart.reduce((sum, item) => sum + getProduct(item.id).price * item.qty, 0);

  const cartCount = () => cart.reduce((sum, item) => sum + item.qty, 0);

  /* ---------------------------------------------------------------------
     3. DOM REFERENCES
     --------------------------------------------------------------------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const productGrid = $('#productGrid');
  const bestsellerGrid = $('#bestsellerGrid');
  const cartToggle = $('#cartToggle');
  const cartClose = $('#cartClose');
  const cartOverlay = $('#cartOverlay');
  const cartDrawer = $('#cartDrawer');
  const cartItemsEl = $('#cartItems');
  const cartEmpty = $('#cartEmpty');
  const cartFooter = $('#cartFooter');
  const cartSubtotal = $('#cartSubtotal');
  const cartCountEl = $('#cartCount');
  const checkoutBtn = $('#checkoutBtn');
  const toastEl = $('#toast');
  const siteHeader = $('#siteHeader');
  const menuToggle = $('#menuToggle');
  const mainNav = $('#mainNav');

  const checkoutOverlay = $('#checkoutOverlay');
  const checkoutClose = $('#checkoutClose');
  const checkoutBody = $('#checkoutBody');
  const checkoutSuccess = $('#checkoutSuccess');
  const checkoutAmount = $('#checkoutAmount');
  const checkoutForm = $('#checkoutForm');
  const payBtn = $('#payBtn');
  const checkoutDone = $('#checkoutDone');

  const newsletterForm = $('#newsletterForm');
  const newsletterStatus = $('#newsletterStatus');

  /* ---------------------------------------------------------------------
     4. RENDER: PRODUCT CARDS
     --------------------------------------------------------------------- */
  function productCardTemplate(product) {
    return `
      <article class="product-card" data-id="${product.id}">
        <div class="product-card__media">
          <span class="product-card__tag">${product.tag}</span>
          <img src="${product.img}" alt="${product.name} perfume bottle" loading="lazy"
               data-fallback="product" data-fallback-label="${product.name}">
        </div>
        <div class="product-card__body">
          <h3 class="product-card__name">${product.name}</h3>
          <p class="product-card__notes">${product.notes}</p>
          <div class="product-card__footer">
            <span class="product-card__price">${NGN.format(product.price)}</span>
            <button class="product-card__add" data-add="${product.id}" type="button">Add to Cart</button>
          </div>
        </div>
      </article>
    `;
  }

  function bestsellerCardTemplate(product) {
    return `
      <article class="bestseller-card" data-id="${product.id}">
        <span class="bestseller-card__ribbon">Best Seller</span>
        <img src="${product.img}" alt="${product.name} perfume bottle" loading="lazy"
             data-fallback="product" data-fallback-label="${product.name}">
        <div class="bestseller-card__info">
          <h3>${product.name}</h3>
          <p>${product.notes}</p>
          <div class="bestseller-card__row">
            <span class="bestseller-card__price">${NGN.format(product.price)}</span>
            <button class="product-card__add" data-add="${product.id}" type="button">Add to Cart</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderCatalogue() {
    productGrid.innerHTML = PRODUCTS.map(productCardTemplate).join('');
    bestsellerGrid.innerHTML = BESTSELLER_IDS.map((id) => bestsellerCardTemplate(getProduct(id))).join('');
    attachImageFallbacks();
    observeGridReveal();
  }

  /* ---------------------------------------------------------------------
     5. IMAGE FALLBACK — if a placeholder image 404s, show an elegant
        gold-on-onyx monogram tile instead of a broken image icon.
     --------------------------------------------------------------------- */
  function attachImageFallbacks() {
    $$('img[data-fallback]').forEach((img) => {
      img.addEventListener('error', () => {
        const wrapper = img.parentElement;
        wrapper.classList.add('img-fallback');
        wrapper.setAttribute('data-fallback-label', img.dataset.fallbackLabel || 'Isle of Scents');
        img.style.display = 'none';
      }, { once: true });
    });
  }

  /* ---------------------------------------------------------------------
     6. CART LOGIC
     --------------------------------------------------------------------- */
  function addToCart(id, sourceBtn) {
    const existing = cart.find((item) => item.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id, qty: 1 });
    }
    renderCart();
    showToast(`${getProduct(id).name} added to your bag`);

    if (sourceBtn) {
      sourceBtn.classList.add('is-added');
      const original = sourceBtn.textContent;
      sourceBtn.textContent = 'Added ✓';
      setTimeout(() => {
        sourceBtn.classList.remove('is-added');
        sourceBtn.textContent = original;
      }, 1200);
    }
  }

  function updateQty(id, delta) {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter((i) => i.id !== id);
    }
    renderCart();
  }

  function removeFromCart(id) {
    cart = cart.filter((i) => i.id !== id);
    renderCart();
  }

  function cartItemTemplate(item) {
    const product = getProduct(item.id);
    return `
      <div class="cart-item" data-id="${item.id}">
        <img class="cart-item__img" src="${product.img}" alt="${product.name}" data-fallback="cart" data-fallback-label="${product.name}">
        <div>
          <div class="cart-item__name">${product.name}</div>
          <div class="cart-item__price">${NGN.format(product.price)}</div>
          <div class="cart-item__qty">
            <button class="qty-btn" data-qty-minus="${item.id}" aria-label="Decrease quantity">&minus;</button>
            <span>${item.qty}</span>
            <button class="qty-btn" data-qty-plus="${item.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="cart-item__remove" data-remove="${item.id}">Remove</button>
      </div>
    `;
  }

  function renderCart() {
    // Update badge
    const count = cartCount();
    cartCountEl.textContent = count;
    cartCountEl.classList.toggle('is-visible', count > 0);

    if (cart.length === 0) {
      cartItemsEl.innerHTML = '';
      cartItemsEl.appendChild(cartEmpty);
      cartFooter.style.display = 'none';
      checkoutBtn.disabled = true;
    } else {
      cartItemsEl.innerHTML = cart.map(cartItemTemplate).join('');
      cartFooter.style.display = 'block';
      checkoutBtn.disabled = false;
      attachImageFallbacks();
    }

    cartSubtotal.innerHTML = NGN.format(cartTotal());
  }

  /* ---------------------------------------------------------------------
     7. CART DRAWER OPEN / CLOSE
     --------------------------------------------------------------------- */
  function openCart() {
    cartDrawer.classList.add('is-open');
    cartOverlay.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    cartToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer.classList.remove('is-open');
    cartOverlay.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartToggle.setAttribute('aria-expanded', 'false');
    if (!checkoutOverlay.classList.contains('is-open')) {
      document.body.style.overflow = '';
    }
  }

  /* ---------------------------------------------------------------------
     8. TOAST
     --------------------------------------------------------------------- */
  let toastTimer;
  function showToast(message) {
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2400);
  }

  /* ---------------------------------------------------------------------
     9. DEMO CHECKOUT MODAL (Paystack-style simulation)
     --------------------------------------------------------------------- */
  function openCheckout() {
    if (cart.length === 0) return;
    checkoutAmount.innerHTML = NGN.format(cartTotal());
    checkoutBody.style.display = 'block';
    checkoutSuccess.classList.remove('is-visible');
    checkoutOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckout() {
    checkoutOverlay.classList.remove('is-open');
    document.body.style.overflow = cartDrawer.classList.contains('is-open') ? 'hidden' : '';
    // Reset form state after transition
    setTimeout(() => {
      checkoutForm.reset();
      payBtn.classList.remove('is-loading');
      payBtn.disabled = false;
    }, 400);
  }

  function handleCheckoutSubmit(e) {
    e.preventDefault();
    payBtn.classList.add('is-loading');
    payBtn.disabled = true;

    // Simulate network / payment gateway delay
    setTimeout(() => {
      checkoutBody.style.display = 'none';
      checkoutSuccess.classList.add('is-visible');
      payBtn.classList.remove('is-loading');
      payBtn.disabled = false;
    }, 1600);
  }

  function handleCheckoutDone() {
    closeCheckout();
    // Clear cart after a successful demo purchase
    cart = [];
    renderCart();
    closeCart();
  }

  // Light input formatting for the demo card fields
  function attachCardFormatting() {
    const cardInput = $('#ckCard');
    const expiryInput = $('#ckExpiry');
    const cvvInput = $('#ckCvv');

    cardInput.addEventListener('input', () => {
      let digits = cardInput.value.replace(/\D/g, '').slice(0, 16);
      cardInput.value = digits.replace(/(.{4})/g, '$1 ').trim();
    });

    expiryInput.addEventListener('input', () => {
      let digits = expiryInput.value.replace(/\D/g, '').slice(0, 4);
      if (digits.length > 2) digits = digits.slice(0, 2) + '/' + digits.slice(2);
      expiryInput.value = digits;
    });

    cvvInput.addEventListener('input', () => {
      cvvInput.value = cvvInput.value.replace(/\D/g, '').slice(0, 3);
    });
  }

  /* ---------------------------------------------------------------------
     10. EVENT DELEGATION for Add / Qty / Remove buttons
     --------------------------------------------------------------------- */
  function attachDelegatedEvents() {
    document.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-add]');
      if (addBtn) {
        addToCart(addBtn.dataset.add, addBtn);
        return;
      }
      const plusBtn = e.target.closest('[data-qty-plus]');
      if (plusBtn) { updateQty(plusBtn.dataset.qtyPlus, 1); return; }

      const minusBtn = e.target.closest('[data-qty-minus]');
      if (minusBtn) { updateQty(minusBtn.dataset.qtyMinus, -1); return; }

      const removeBtn = e.target.closest('[data-remove]');
      if (removeBtn) { removeFromCart(removeBtn.dataset.remove); return; }
    });
  }

  /* ---------------------------------------------------------------------
     11. STICKY NAV + MOBILE MENU
     --------------------------------------------------------------------- */
  function initNav() {
    const onScroll = () => {
      siteHeader.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      menuToggle.classList.toggle('is-active', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile menu when a link is tapped
    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-open');
        menuToggle.classList.remove('is-active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------------------------------------------------------------------
     12. SCROLL REVEAL (IntersectionObserver)
     --------------------------------------------------------------------- */
  function initScrollReveal() {
    const targets = $$('[data-reveal]');
    if (!('IntersectionObserver' in window) || targets.length === 0) {
      targets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    targets.forEach((el) => io.observe(el));
  }

  // Separate observer for grids (staggers children via CSS class on parent)
  function observeGridReveal() {
    const grids = [productGrid, bestsellerGrid, $('.feature-grid'), $('.review-grid')].filter(Boolean);
    if (!('IntersectionObserver' in window)) {
      grids.forEach((g) => g.classList.add('is-revealed'));
      return;
    }
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    grids.forEach((g) => io.observe(g));
  }

  /* ---------------------------------------------------------------------
     13. HERO "SCENT MIST" CANVAS — soft drifting gold particles
     --------------------------------------------------------------------- */
  function initHeroMist() {
    const canvas = $('#heroMist');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width, height, rafId;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      width = canvas.width = canvas.offsetWidth * devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * devicePixelRatio;
    }

    function createParticles() {
      const count = Math.min(38, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 26000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: height + Math.random() * height * 0.5,
        r: (Math.random() * 1.6 + 0.6) * devicePixelRatio,
        speed: (Math.random() * 0.35 + 0.08) * devicePixelRatio,
        drift: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
        alpha: Math.random() * 0.35 + 0.08
      }));
    }

    function tick() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 205, 148, ${p.alpha})`;
        ctx.fill();
      });
      rafId = requestAnimationFrame(tick);
    }

    resize();
    createParticles();
    if (!reduceMotion) {
      tick();
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(rafId);
        resize();
        createParticles();
        if (!reduceMotion) tick();
      }, 200);
    });
  }

  /* ---------------------------------------------------------------------
     14. NEWSLETTER (demo submission)
     --------------------------------------------------------------------- */
  function initNewsletter() {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = $('#newsletterEmail');
      if (!emailInput.value || !emailInput.validity.valid) {
        newsletterStatus.textContent = 'Please enter a valid email address.';
        newsletterStatus.style.color = '#d98a76';
        return;
      }
      newsletterStatus.style.color = '';
      newsletterStatus.textContent = `Thank you — a confirmation has been sent to ${emailInput.value}.`;
      emailInput.value = '';
    });
  }

  /* ---------------------------------------------------------------------
     15. PRELOADER
     --------------------------------------------------------------------- */
  function initPreloader() {
    const preloader = $('#preloader');
    window.addEventListener('load', () => {
      setTimeout(() => preloader.classList.add('is-hidden'), 900);
    });
    // Failsafe in case 'load' fires very late (slow external images)
    setTimeout(() => preloader.classList.add('is-hidden'), 3200);
  }

  /* ---------------------------------------------------------------------
     16. INIT
     --------------------------------------------------------------------- */
  function init() {
    $('#year').textContent = new Date().getFullYear();

    renderCatalogue();
    renderCart();
    attachDelegatedEvents();
    attachCardFormatting();
    initNav();
    initScrollReveal();
    initHeroMist();
    initNewsletter();
    initPreloader();

    cartToggle.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    checkoutBtn.addEventListener('click', openCheckout);
    checkoutClose.addEventListener('click', closeCheckout);
    checkoutOverlay.addEventListener('click', (e) => {
      if (e.target === checkoutOverlay) closeCheckout();
    });
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    checkoutDone.addEventListener('click', handleCheckoutDone);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (checkoutOverlay.classList.contains('is-open')) closeCheckout();
        else if (cartDrawer.classList.contains('is-open')) closeCart();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();