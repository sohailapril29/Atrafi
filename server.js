const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch'); // for PayPal REST API calls

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PAYPAL_CLIENT = 'AXjb9TjKWh8lw3pTXQXQuXYy5DToceT5xrStyQerw4P009ILwaf4Mn9UEO095Jsq2MQ142VZMihKZ_Qy';
const PAYPAL_SECRET = 'EAvrmeHUMgE6qjlcUR2-iL2wVuBP5nF9Rpul1RV__HrG7jvo3JGMNzRBa1t18mUzjVb6LHwj3XomduQ4';
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // Use sandbox for testing

// Generate access token
async function generateAccessToken() {
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(PAYPAL_CLIENT + ':' + PAYPAL_SECRET).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    return data.access_token;
}

// Create order
app.post('/create-paypal-order', async (req, res) => {
    const { total } = req.body;
    const accessToken = await generateAccessToken();

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
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

    const data = await response.json();
    res.json(data);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
