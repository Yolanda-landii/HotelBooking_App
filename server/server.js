require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Use environment variable
// console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY);

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
    console.log('Request body:', req.body);
  const { amount } = req.body;
  console.log('Amount:', amount);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: 'usd', // Temporary test with USD
      });
      
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
