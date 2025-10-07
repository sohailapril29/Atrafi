const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('sk_test_tR3PYbcVNZZ796tH88S4VQ2u'); // Replace with your secret key
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serve static files

const YOUR_DOMAIN = 'http://localhost:3000';

app.post('/create-checkout-session', async (req, res) => {
    const { cartItems } = req.body;

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
    }

    const line_items = cartItems.map(item => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: item.name,
                images: [item.image],
            },
            unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
    }));

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${YOUR_DOMAIN}/html/success.html`,
            cancel_url: `${YOUR_DOMAIN}/html/cancel.html`,
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Redirect root to index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
