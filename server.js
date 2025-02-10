require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 

app.use(cors()); 
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY);
  const { amount } = req.body;
  console.log('Request Amount:', amount);

  try {
      const paymentIntent = await stripe.paymentIntents.create({
          amount: amount * 100,
          currency: 'usd',
      });
      console.log('Payment Intent Created:', paymentIntent);
      res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
      console.error('Error creating payment intent:', error.message);
      res.status(500).json({ error: error.message });
  }
});


const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
