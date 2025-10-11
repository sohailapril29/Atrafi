// ==========================
// Language Support
// ==========================
let currentLang = 'en'; // default
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentLang = btn.getAttribute('data-lang');
        document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
        renderCartItems();
        renderWishlistItems();
    });
});

// ==========================
// Assign unique IDs to products
// ==========================
document.querySelectorAll('.product').forEach((product, index) => {
    if (!product.dataset.id) {
        const name = product.querySelector('.product-title')?.textContent || 'product';
        product.dataset.id = name.toLowerCase().replace(/\s+/g, '-') + '-' + index;
    }
});

// ==========================
// Cart Functions
// ==========================
function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.querySelector('.cart-count');
    if (cartBadge) {
        cartBadge.style.display = count > 0 ? 'inline-block' : 'none';
        cartBadge.textContent = count;
    }
}

function addToCart(productCard) {
    const id = productCard.dataset.id;
    const nameEn = productCard.querySelector(".product-title")?.textContent || 'Product';
    const nameAr = productCard.dataset.nameAr || nameEn;
    const priceText = productCard.querySelector(".product-price")?.textContent || '0';
    const price = parseFloat(priceText.replace(/[^\d.]/g, ""));
    const imgSrc = productCard.querySelector(".product-img").src;
    const sizeSelect = productCard.querySelector(".size-select");
    const size = sizeSelect ? sizeSelect.value : null;

    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    const existingItem = cartItems.find(item => item.id === id && item.size === size);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({ id, nameEn, nameAr, price, quantity: 1, image: imgSrc, size });
    }

    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    updateCartCount();
    renderCartItems();
}

// ==========================
// Wishlist Functions
// ==========================
function updateWishlistCount() {
    const wishlistItems = JSON.parse(localStorage.getItem("wishlistItems")) || [];
    const count = wishlistItems.length;
    const wishBadge = document.querySelector('.wishlist-count');

    if (wishBadge) {
        wishBadge.style.display = count > 0 ? 'inline-block' : 'none';
        wishBadge.textContent = count;
    }

    // Update heart icons on all product cards
    document.querySelectorAll('.product').forEach(product => {
        const id = product.dataset.id;
        const size = product.querySelector(".size-select")?.value || null;
        const icon = product.querySelector(".wishlist-btn i");
        const exists = wishlistItems.find(item => item.id === id && item.size === size);
        if (icon) icon.className = exists ? "ri-heart-fill" : "ri-heart-line";
    });
}

function addToWishlist(productCard) {
    const id = productCard.dataset.id;
    const name = productCard.querySelector(".product-title").textContent;
    const priceText = productCard.querySelector(".product-price").textContent;
    const price = parseFloat(priceText.replace(/[^\d.]/g, ""));
    const imgSrc = productCard.querySelector(".product-img").src;
    const sizeSelect = productCard.querySelector(".size-select");
    const size = sizeSelect ? sizeSelect.value : null;

    let wishlistItems = JSON.parse(localStorage.getItem("wishlistItems")) || [];
    const existingIndex = wishlistItems.findIndex(item => item.id === id && item.size === size);

    if (existingIndex === -1) {
        wishlistItems.push({ id, name, price, image: imgSrc, size });
    } else {
        wishlistItems.splice(existingIndex, 1);
    }

    localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
    updateWishlistCount();
    renderWishlistItems();
}

function removeFromWishlist(index) {
    let wishlistItems = JSON.parse(localStorage.getItem("wishlistItems")) || [];
    wishlistItems.splice(index, 1);
    localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
    updateWishlistCount();
    renderWishlistItems();
}

// ==========================
// Render Functions
// ==========================
function renderCartItems() {
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotalContainer = document.getElementById("cartTotal");
    const paypalContainer = document.getElementById('paypal-button-container');
    if (!cartItemsContainer || !cartTotalContainer || !paypalContainer) return;

    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    cartItemsContainer.innerHTML = "";
    paypalContainer.innerHTML = "";
    let total = 0;

    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = currentLang === 'ar'
            ? "<p>سلة التسوق فارغة.</p>"
            : "<p>Your cart is empty.</p>";
        cartTotalContainer.innerHTML = "";
        return;
    }

    cartItems.forEach((item, index) => {
        total += item.price * item.quantity;
        const name = currentLang === 'ar' ? (item.nameAr || item.nameEn) : item.nameEn;
        const itemElement = document.createElement("div");
        itemElement.classList.add("cart-item");
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${name}">
            <div class="item-details">
                <h3>${name}</h3>
                ${item.size ? `<p>${currentLang === 'ar' ? 'الحجم' : 'Size'}: ${item.size}</p>` : ''}
                <p>${currentLang === 'ar' ? 'السعر' : 'Price'}: <span>$${item.price.toFixed(2)}</span></p>
                <div class="quantity-controls">
                    <button onclick="changeQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <i class="ri-close-line remove-item" onclick="removeItem(${index})"></i>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    cartTotalContainer.innerHTML = `
        <h3>${currentLang === 'ar' ? 'الإجمالي' : 'Total'}:</h3>
        <p class="total-amount">$${total.toFixed(2)}</p>
    `;

    // Render PayPal button
    if (total > 0) renderPaypalButton(total);
}

function renderWishlistItems() {
    const wishlistContainer = document.getElementById("wishlistItems");
    if (!wishlistContainer) return;

    let wishlistItems = JSON.parse(localStorage.getItem("wishlistItems")) || [];
    wishlistContainer.innerHTML = "";

    if (wishlistItems.length === 0) {
        wishlistContainer.innerHTML = currentLang === 'ar'
            ? "<p>قائمة الرغبات فارغة.</p>"
            : "<p>Your wishlist is empty.</p>";
        return;
    }

    wishlistItems.forEach((item, index) => {
        const itemEl = document.createElement("div");
        itemEl.classList.add("cart-item");
        itemEl.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h3>${item.name}</h3>
                ${item.size ? `<p>${currentLang === 'ar' ? 'الحجم' : 'Size'}: ${item.size}</p>` : ''}
                <p>${currentLang === 'ar' ? 'السعر' : 'Price'}: <span>$${item.price.toFixed(2)}</span></p>
            </div>
            <i class="ri-close-line remove-item" onclick="removeFromWishlist(${index})"></i>
        `;
        wishlistContainer.appendChild(itemEl);
    });
}

// ==========================
// Quantity / Remove functions
// ==========================
function changeQuantity(index, change) {
    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    cartItems[index].quantity += change;
    if (cartItems[index].quantity <= 0) cartItems.splice(index, 1);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    updateCartCount();
    renderCartItems();
}

function removeItem(index) {
    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    cartItems.splice(index, 1);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    updateCartCount();
    renderCartItems();
}

// ==========================
// PayPal Button
// ==========================
function renderPaypalButton(total) {
    const container = document.getElementById('paypal-button-container');
    if (!container || typeof paypal === 'undefined') return;

    container.innerHTML = ''; // clear old buttons

    paypal.Buttons({
        createOrder: (data, actions) => {
            return actions.order.create({
                purchase_units: [{ amount: { value: total.toFixed(2) } }]
            });
        },
        onApprove: (data, actions) => {
            return actions.order.capture().then(details => {
                alert((currentLang === 'ar' ? 'تم الدفع بواسطة ' : 'Payment completed by ') + (details.payer.name?.given_name || 'payer'));
                localStorage.removeItem('cartItems');
                updateCartCount();
                renderCartItems();
            });
        },
        onError: err => {
            console.error(err);
            alert(currentLang === 'ar' ? 'فشل الدفع عبر باي بال.' : 'PayPal payment failed.');
        }
    }).render('#paypal-button-container');
}

// ==========================
// Initialize
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCartItems();
    updateWishlistCount();
    renderWishlistItems();
});

// ==========================
// Expose functions globally
// ==========================
window.addToCart = addToCart;
window.addToWishlist = addToWishlist;
window.removeFromWishlist = removeFromWishlist;
window.changeQuantity = changeQuantity;
window.removeItem = removeItem;
