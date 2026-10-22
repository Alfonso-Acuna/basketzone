/* =========================================================
   BasketZone · Lógica de la tienda
   ---------------------------------------------------------
   - Catálogo dinámico (Supabase o datos demo)
   - Filtros por categoría, marca y búsqueda
   - Carrito persistente en localStorage
   - Registro / inicio de sesión
   - Pedido atómico con descuento de stock en el servidor
   ========================================================= */

import { IS_CONFIGURED } from './config.js';
import { DEMO_CATEGORIES, DEMO_BRANDS, DEMO_PRODUCTS } from './demo-data.js';

const CART_KEY = 'bz_cart_v1';
const SHIPPING_FLAT = 499;
const FREE_SHIPPING_FROM = 8000;

const state = {
    products: [],
    categories: [],
    brands: [],
    cart: [],
    session: null,
    db: null,
    demo: true
};

const $ = (id) => document.getElementById(id);
const money = (cents) => new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
}).format((cents || 0) / 100);

/* ---------------------------------------------------------
   Carrito
   --------------------------------------------------------- */
function loadCart() {
    try {
        const raw = localStorage.getItem(CART_KEY);
        state.cart = raw ? JSON.parse(raw) : [];
    } catch (_) {
        state.cart = [];
    }
}

function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); } catch (_) { /* modo privado */ }
}

function cartSubtotal() {
    return state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function cartShipping() {
    if (state.cart.length === 0) { return 0; }
    return cartSubtotal() >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FLAT;
}

function cartCount() {
    return state.cart.reduce((sum, item) => sum + item.qty, 0);
}

/* ---------------------------------------------------------
   Catálogo
   --------------------------------------------------------- */
async function loadCatalog() {
    if (state.db) {
        const [{ categories, brands }, products] = await Promise.all([
            state.db.fetchFilters(),
            state.db.fetchCatalog()
        ]);
        state.categories = categories;
        state.brands = brands;
        state.products = products;
    } else {
        state.categories = DEMO_CATEGORIES;
        state.brands = DEMO_BRANDS;
        state.products = DEMO_PRODUCTS;
    }
}

function filteredProducts() {
    const category = $('filterCategory').value;
    const brand = $('filterBrand').value;
    const search = $('filterSearch').value.trim().toLowerCase();

    return state.products.filter((p) => {
        if (category && p.category_slug !== category) { return false; }
        if (brand && p.brand_slug !== brand) { return false; }
        if (search && !p.name.toLowerCase().includes(search)) { return false; }
        return true;
    });
}

function renderFilters() {
    const cat = $('filterCategory');
    const brand = $('filterBrand');

    state.categories.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.slug;
        opt.textContent = c.name;
        cat.appendChild(opt);
    });

    state.brands.forEach((b) => {
        const opt = document.createElement('option');
        opt.value = b.slug;
        opt.textContent = b.name;
        brand.appendChild(opt);
    });
}

function renderProducts() {
    const grid = $('productGrid');
    const list = filteredProducts();

    grid.innerHTML = '';
    $('shopEmpty').hidden = list.length > 0;
    $('shopMeta').textContent = list.length === 0
        ? ''
        : `${list.length} ${list.length === 1 ? 'producto' : 'productos'} · ${state.demo ? 'catálogo de demostración' : 'stock en tiempo real'}`;

    list.forEach((p) => {
        const variants = Array.isArray(p.variants) ? p.variants : [];
        const available = variants.filter((v) => v.stock > 0);
        const soldOut = available.length === 0;

        const article = document.createElement('article');
        article.className = 'product-card';
        article.innerHTML = `
            <div class="product-media">
                <img src="${p.image_url}" alt="${p.name}" loading="lazy" width="600" height="450">
                <span class="product-tag">${p.category_name || ''}</span>
                <span class="product-stock ${soldOut ? 'is-out' : (p.total_stock < 6 ? 'is-low' : '')}">
                    ${soldOut ? 'Agotado' : `${p.total_stock} uds.`}
                </span>
            </div>
            <div class="product-body">
                <p class="product-brand">${p.brand_name || ''}</p>
                <h3>${p.name}</h3>
                <p class="product-desc">${p.description || ''}</p>
                <p class="product-price">${money(p.price_cents)}</p>
                <div class="product-actions">
                    <label class="shop-field shop-field-compact">
                        <span class="sr-only">Talla</span>
                        <select class="product-size" data-size="${p.id}" ${soldOut ? 'disabled' : ''}>
                            <option value="">${soldOut ? 'Sin stock' : 'Elegir talla'}</option>
                            ${variants.map((v) => `
                                <option value="${v.id}" ${v.stock === 0 ? 'disabled' : ''}>
                                    ${v.size}${v.stock === 0 ? ' — agotada' : ` (${v.stock})`}
                                </option>`).join('')}
                        </select>
                    </label>
                    <button type="button" class="btn btn-primary btn-sm" data-add="${p.id}" ${soldOut ? 'disabled' : ''}>
                        Añadir
                    </button>
                </div>
                <p class="product-feedback" data-feedback="${p.id}" role="status"></p>
            </div>`;
        grid.appendChild(article);
    });
}

/* ---------------------------------------------------------
   Añadir al carrito
   --------------------------------------------------------- */
function addToCart(productId, variantId) {
    const product = state.products.find((p) => String(p.id) === String(productId));
    if (!product) { return; }
    const variant = (product.variants || []).find((v) => String(v.id) === String(variantId));
    if (!variant || variant.stock <= 0) { return; }

    const existing = state.cart.find((i) => String(i.variantId) === String(variantId));
    const inCart = existing ? existing.qty : 0;

    if (inCart + 1 > variant.stock) {
        showFeedback(productId, 'No queda más stock de esa talla.');
        return;
    }

    if (existing) {
        existing.qty += 1;
    } else {
        state.cart.push({
            variantId: variant.id,
            productId: product.id,
            name: product.name,
            size: variant.size,
            price: product.price_cents,
            qty: 1,
            image: product.image_url
        });
    }

    saveCart();
    renderCart();
    showFeedback(productId, `Añadido: ${product.name} (${variant.size}).`);
    $('cartCount').classList.add('is-bump');
    setTimeout(() => $('cartCount').classList.remove('is-bump'), 350);
}

function showFeedback(productId, message) {
    const el = document.querySelector(`[data-feedback="${productId}"]`);
    if (!el) { return; }
    el.textContent = message;
    setTimeout(() => { if (el.textContent === message) { el.textContent = ''; } }, 3200);
}

/* ---------------------------------------------------------
   Render del carrito
   --------------------------------------------------------- */
function renderCart() {
    const list = $('cartItems');
    list.innerHTML = '';

    $('cartEmpty').hidden = state.cart.length > 0;
    $('cartCount').textContent = cartCount();

    state.cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
            <img src="${item.image}" alt="" width="64" height="64" loading="lazy">
            <div class="cart-item-info">
                <strong>${item.name}</strong>
                <span>Talla ${item.size} · ${money(item.price)}</span>
                <div class="cart-qty">
                    <button type="button" data-qty="-1" data-index="${index}" aria-label="Quitar una unidad">−</button>
                    <span>${item.qty}</span>
                    <button type="button" data-qty="1" data-index="${index}" aria-label="Añadir una unidad">+</button>
                </div>
            </div>
            <button type="button" class="cart-remove" data-remove="${index}" aria-label="Eliminar ${item.name}">&times;</button>`;
        list.appendChild(li);
    });

    const subtotal = cartSubtotal();
    $('cartSubtotal').textContent = money(subtotal);
    $('cartShipping').textContent = state.cart.length === 0
        ? '—'
        : (cartShipping() === 0 ? 'Gratis' : money(cartShipping()));
    $('cartTotal').textContent = money(subtotal + cartShipping());
    $('checkoutSubmit').disabled = state.cart.length === 0;
}

function changeQty(index, delta) {
    const item = state.cart[index];
    if (!item) { return; }
    item.qty += delta;
    if (item.qty <= 0) { state.cart.splice(index, 1); }
    saveCart();
    renderCart();
}

/* ---------------------------------------------------------
   Cajones (carrito / cuenta)
   --------------------------------------------------------- */
function openDrawer(id) {
    const drawer = $(id);
    const backdrop = $(id === 'cartDrawer' ? 'cartBackdrop' : 'authBackdrop');
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    backdrop.hidden = false;
    document.body.classList.add('no-scroll');
}

function closeDrawer(id) {
    const drawer = $(id);
    const backdrop = $(id === 'cartDrawer' ? 'cartBackdrop' : 'authBackdrop');
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.hidden = true;
    if (!$('cartDrawer').classList.contains('is-open') && !$('authDrawer').classList.contains('is-open')) {
        document.body.classList.remove('no-scroll');
    }
}

/* ---------------------------------------------------------
   Sesión
   --------------------------------------------------------- */
function paintSession() {
    const signedIn = !!state.session;
    $('authSignedIn').hidden = !signedIn;
    $('authForms').hidden = signedIn;
    $('openAuth').textContent = signedIn
        ? (state.session.user.email || 'Mi cuenta')
        : 'Entrar';

    if (signedIn) {
        $('authHello').textContent = `Sesión iniciada como ${state.session.user.email}.`;
        $('checkoutEmail').value = state.session.user.email || $('checkoutEmail').value;
        $('checkoutSession').textContent = state.demo
            ? 'Sesión de demostración: el pedido no se guardará.'
            : 'Sesión activa: tu pedido se guardará en tu cuenta.';
    } else {
        $('checkoutSession').textContent = state.demo
            ? 'Modo demo: puedes simular el pedido sin cuenta.'
            : 'Necesitas iniciar sesión para confirmar el pedido.';
    }
}

/* ---------------------------------------------------------
   Pedido
   --------------------------------------------------------- */
async function submitOrder(event) {
    event.preventDefault();
    const status = $('checkoutStatus');
    status.className = 'form-status';
    status.textContent = '';

    const customer = {
        name: $('checkoutName').value.trim(),
        email: $('checkoutEmail').value.trim(),
        address: $('checkoutAddress').value.trim()
    };

    if (!customer.name || !customer.email || !customer.address) {
        status.textContent = 'Completa nombre, correo y dirección.';
        status.className = 'form-status is-error';
        return;
    }

    if (state.cart.length === 0) {
        status.textContent = 'El carrito está vacío.';
        status.className = 'form-status is-error';
        return;
    }

    if (state.demo) {
        const total = cartSubtotal() + cartShipping();
        status.textContent = `Pedido simulado por ${money(total)}. Conecta Supabase en js/config.js para guardarlo de verdad.`;
        status.className = 'form-status is-ok';
        state.cart = [];
        saveCart();
        renderCart();
        return;
    }

    if (!state.session) {
        status.textContent = 'Inicia sesión para confirmar el pedido.';
        status.className = 'form-status is-error';
        openDrawer('authDrawer');
        return;
    }

    $('checkoutSubmit').disabled = true;
    $('checkoutSubmit').textContent = 'Procesando…';

    try {
        const result = await state.db.createOrder({
            customer,
            items: state.cart.map((i) => ({ variantId: i.variantId, quantity: i.qty }))
        });

        state.cart = [];
        saveCart();
        renderCart();

        status.textContent = `Pedido ${String(result.order_id).slice(0, 8)} confirmado por ${money(result.total_cents)}.`;
        status.className = 'form-status is-ok';

        if (state.db && typeof state.db.fetchCatalog === 'function') {
            state.products = await state.db.fetchCatalog();
            renderProducts();
        }
    } catch (error) {
        status.textContent = error.message || 'No se pudo guardar el pedido.';
        status.className = 'form-status is-error';
    } finally {
        $('checkoutSubmit').disabled = false;
        $('checkoutSubmit').textContent = 'Confirmar pedido';
    }
}

/* ---------------------------------------------------------
   Auth
   --------------------------------------------------------- */
async function handleLogin(event) {
    event.preventDefault();
    const status = $('loginStatus');
    status.textContent = '';
    status.className = 'form-status';

    if (state.demo) {
        status.textContent = 'Modo demo: configura Supabase para iniciar sesión.';
        status.className = 'form-status is-error';
        return;
    }

    try {
        await state.db.signIn({
            email: $('loginEmail').value.trim(),
            password: $('loginPassword').value
        });
        state.session = await state.db.getSession();
        paintSession();
        closeDrawer('authDrawer');
    } catch (error) {
        status.textContent = error.message || 'No se pudo iniciar sesión.';
        status.className = 'form-status is-error';
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const status = $('registerStatus');
    status.textContent = '';
    status.className = 'form-status';

    if (state.demo) {
        status.textContent = 'Modo demo: configura Supabase para crear cuentas.';
        status.className = 'form-status is-error';
        return;
    }

    try {
        await state.db.signUp({
            email: $('registerEmail').value.trim(),
            password: $('registerPassword').value,
            fullName: $('registerName').value.trim()
        });
        status.textContent = 'Cuenta creada. Revisa tu correo si Supabase exige confirmación.';
        status.className = 'form-status is-ok';
    } catch (error) {
        status.textContent = error.message || 'No se pudo crear la cuenta.';
        status.className = 'form-status is-error';
    }
}

/* ---------------------------------------------------------
   Arranque
   --------------------------------------------------------- */
function bindEvents() {
    ['filterCategory', 'filterBrand'].forEach((id) => {
        $(id).addEventListener('change', renderProducts);
    });
    $('filterSearch').addEventListener('input', renderProducts);
    $('clearFilters').addEventListener('click', () => {
        $('filterCategory').value = '';
        $('filterBrand').value = '';
        $('filterSearch').value = '';
        renderProducts();
    });

    $('openCart').addEventListener('click', () => openDrawer('cartDrawer'));
    $('closeCart').addEventListener('click', () => closeDrawer('cartDrawer'));
    $('cartBackdrop').addEventListener('click', () => closeDrawer('cartDrawer'));

    $('openAuth').addEventListener('click', () => openDrawer('authDrawer'));
    $('closeAuth').addEventListener('click', () => closeDrawer('authDrawer'));
    $('authBackdrop').addEventListener('click', () => closeDrawer('authDrawer'));

    document.querySelectorAll('[data-auth-tab]').forEach((tab) => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('[data-auth-tab]').forEach((t) => t.classList.remove('is-active'));
            tab.classList.add('is-active');
            const isLogin = tab.getAttribute('data-auth-tab') === 'login';
            $('loginForm').hidden = !isLogin;
            $('registerForm').hidden = isLogin;
        });
    });

    $('loginForm').addEventListener('submit', handleLogin);
    $('registerForm').addEventListener('submit', handleRegister);
    $('signOutBtn').addEventListener('click', async () => {
        if (state.db) { await state.db.signOut(); }
        state.session = null;
        paintSession();
        closeDrawer('authDrawer');
    });

    $('checkoutForm').addEventListener('submit', submitOrder);

    $('productGrid').addEventListener('click', (event) => {
        const btn = event.target.closest('[data-add]');
        if (!btn) { return; }
        const productId = btn.getAttribute('data-add');
        const select = document.querySelector(`[data-size="${productId}"]`);
        if (!select || !select.value) {
            showFeedback(productId, 'Elige una talla antes de añadir.');
            if (select) { select.focus(); }
            return;
        }
        addToCart(productId, select.value);
    });

    $('cartItems').addEventListener('click', (event) => {
        const remove = event.target.closest('[data-remove]');
        if (remove) {
            state.cart.splice(Number(remove.getAttribute('data-remove')), 1);
            saveCart();
            renderCart();
            return;
        }
        const qty = event.target.closest('[data-qty]');
        if (qty) {
            changeQty(Number(qty.getAttribute('data-index')), Number(qty.getAttribute('data-qty')));
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeDrawer('cartDrawer');
            closeDrawer('authDrawer');
        }
    });
}

async function init() {
    loadCart();
    bindEvents();
    renderCart();

    if (IS_CONFIGURED) {
        try {
            state.db = await import('./supabase.js');
            const session = await state.db.getSession();
            state.session = session;
            state.demo = false;
            $('shopBanner').textContent = 'Catálogo conectado a Supabase · stock en tiempo real.';
            $('shopBanner').className = 'shop-banner is-live';
        } catch (error) {
            state.db = null;
            state.demo = true;
            $('shopBanner').textContent = 'No se pudo conectar con Supabase: se muestran datos de demostración.';
            $('shopBanner').className = 'shop-banner is-warn';
        }
    } else {
        state.demo = true;
        $('shopBanner').innerHTML = 'Modo demo · datos de ejemplo. Para activar stock y pedidos reales, añade tu <code>SUPABASE_URL</code> y <code>SUPABASE_ANON_KEY</code> en <code>js/config.js</code>.';
        $('shopBanner').className = 'shop-banner is-demo';
    }

    paintSession();

    try {
        await loadCatalog();
    } catch (error) {
        state.demo = true;
        state.db = null;
        state.products = DEMO_PRODUCTS;
        state.categories = DEMO_CATEGORIES;
        state.brands = DEMO_BRANDS;
        $('shopBanner').textContent = 'Error al leer el catálogo: se muestran datos de demostración.';
        $('shopBanner').className = 'shop-banner is-warn';
    }

    renderFilters();
    renderProducts();
    renderCart();

    if (state.db) {
        state.db.onAuthChange((session) => {
            state.session = session;
            paintSession();
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
