const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

const PAYPAL_CLIENT = 'YOUR_CLIENT_ID';
const PAYPAL_SECRET = 'YOUR_SECRET';
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // Sandbox URL

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve static HTML pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/cart.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cart.html')));
app.get('/prosthetics.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'prosthetics.html')));

// Generate PayPal access token
async function generateAccessToken() {
    const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${PAYPAL_CLIENT}:${PAYPAL_SECRET}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`PayPal auth failed: ${res.status} - ${text}`);
    }

    const data = await res.json();
    return data.access_token;
}

// Create PayPal order
app.post('/create-paypal-order', async (req, res) => {
    try {
        const { total } = req.body;

        if (!total || isNaN(total)) {
            return res.status(400).json({ error: 'Invalid total amount' });
        }

        const accessToken = await generateAccessToken();

        const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [
                    { amount: { currency_code: 'USD', value: total.toFixed(2) } }
                ]
            })
        });

        if (!orderRes.ok) {
            const text = await orderRes.text();
            throw new Error(`PayPal order creation failed: ${orderRes.status} - ${text}`);
        }

        const data = await orderRes.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'PayPal order creation failed', details: err.message });
    }
});

// Capture PayPal order (optional server-side capture)
app.post('/capture-paypal-order', async (req, res) => {
    try {
        const { orderID } = req.body;
        if (!orderID) return res.status(400).json({ error: 'Missing orderID' });

        const accessToken = await generateAccessToken();

        const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!captureRes.ok) {
            const text = await captureRes.text();
            throw new Error(`PayPal capture failed: ${captureRes.status} - ${text}`);
        }

        const data = await captureRes.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'PayPal capture failed', details: err.message });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
