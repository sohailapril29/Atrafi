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
const id = productCard.dataset.id; // use unique id
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
    alert("Item added to cart!");
}

// Render cart items
function renderCartItems() {
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotalContainer = document.getElementById("cartTotal");
    if (!cartItemsContainer || !cartTotalContainer) return;

    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    cartItemsContainer.innerHTML = "";
    let total = 0;

    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
        cartTotalContainer.innerHTML = "";
    } else {
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

        cartTotalContainer.innerHTML = `
            <h3>Total:</h3>
            <p class="total-amount">$${total.toFixed(2)}</p>
        `;
    }
}

// Change quantity
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

// Checkout
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    renderCartItems();

    document.querySelector('.checkout-btn')?.addEventListener('click', async () => {
        const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
        if (cartItems.length === 0) return alert("Cart is empty!");

        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ cartItems })
        });

        const data = await response.json();
        if (data.url) window.location.href = data.url;
    });
});

// Mobile menu toggle
document.getElementById('menu-icon')?.addEventListener('click', () => {
    document.querySelector('.navbar').classList.toggle('active');
});
