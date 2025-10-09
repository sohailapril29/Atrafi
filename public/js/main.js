// Assign unique IDs to products automatically
document.querySelectorAll('.product').forEach((product, index) => {
    if (!product.dataset.id) {
        const name = product.querySelector('.product-title')?.textContent || 'product';
        product.dataset.id = name.toLowerCase().replace(/\s+/g, '-') + '-' + index;
    }
});

// Update cart count in header
function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    const countElement = document.querySelector(".cart-count");
    if (countElement) {
        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
        countElement.textContent = totalItems;
    }
}

// Add product to cart
function addToCart(productCard) {
    const id = productCard.dataset.id;
    const name = productCard.querySelector(".product-title").textContent;
    const priceText = productCard.querySelector(".product-price").textContent;
    const price = parseFloat(priceText.replace(/[^\d.]/g, ""));
    const imgSrc = productCard.querySelector(".product-img").src;

    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    const existingItem = cartItems.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({ id, name, price, quantity: 1, image: imgSrc });
    }

    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    updateCartCount();
    renderCartItems();
}

// Render cart items and PayPal button
function renderCartItems() {
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotalContainer = document.getElementById("cartTotal");
    const paypalContainer = document.getElementById('paypal-button-container');

    if (!cartItemsContainer || !cartTotalContainer || !paypalContainer) return;

    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    cartItemsContainer.innerHTML = "";
    paypalContainer.innerHTML = ""; // Clear previous PayPal button
    let total = 0;

    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
        cartTotalContainer.innerHTML = "";
        return;
    }

    // Render each cart item
    cartItems.forEach((item, index) => {
        total += item.price * item.quantity;
        const itemElement = document.createElement("div");
        itemElement.classList.add("cart-item");
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p>Price: <span>$${item.price.toFixed(2)}</span></p>
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

    // Update total
    cartTotalContainer.innerHTML = `
        <h3>Total:</h3>
        <p class="total-amount">$${total.toFixed(2)}</p>
    `;

    // Render PayPal button (only once)
    if (typeof paypal !== 'undefined') {
        paypal.Buttons({
            createOrder: (data, actions) => {
                return actions.order.create({
                    purchase_units: [{ amount: { value: total.toFixed(2) } }]
                });
            },
            onApprove: (data, actions) => {
                return actions.order.capture().then(details => {
                    alert("Payment completed by " + (details.payer.name?.given_name || 'payer') + ".");
                    localStorage.removeItem('cartItems');
                    updateCartCount();
                    renderCartItems();
                });
            },
            onError: err => {
                console.error(err);
                alert('PayPal payment failed.');
            }
        }).render('#paypal-button-container');
    }
}

// Quantity change
function changeQuantity(index, change) {
    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    cartItems[index].quantity += change;
    if (cartItems[index].quantity <= 0) cartItems.splice(index, 1);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    updateCartCount();
    renderCartItems();
}

// Remove item
function removeItem(index) {
    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    cartItems.splice(index, 1);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    updateCartCount();
    renderCartItems();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCartItems();
});

window.addToCart = addToCart;
