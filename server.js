// No node-fetch import
const express = require('express');
const cors = require('cors');
const path = require('path');

const PAYPAL_CLIENT = 'YOUR_CLIENT_ID';
const PAYPAL_SECRET = 'YOUR_SECRET';
const PAYPAL_API = 'https://api-m.sandbox.paypal.com';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function generateAccessToken() {
    const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${PAYPAL_CLIENT}:${PAYPAL_SECRET}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    const data = await res.json();
    return data.access_token;
}

app.post('/create-paypal-order', async (req, res) => {
    try {
        const { total } = req.body;
        const accessToken = await generateAccessToken();
        const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{ amount: { currency_code: 'USD', value: total.toFixed(2) } }]
            })
        });
        const data = await orderRes.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'PayPal order creation failed' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
