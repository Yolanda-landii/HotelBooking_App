require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 
console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY);


app.use(cors()); 
app.use(express.json());

app.post("/create-payment-intent", async (req, res) => {
  try {
    console.log("Received payment request:", req.body); // Debug input
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      console.error("Invalid amount:", amount);
      return res.status(400).json({ error: "Invalid amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],
    });

    console.log("Payment Intent Created:", paymentIntent); 
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});




const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
