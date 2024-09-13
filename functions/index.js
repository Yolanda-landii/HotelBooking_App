const { onCall } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const stripe = require('stripe')('pk_test_51PyWUREMz50nif55fK8C9cxOdEly9YE9oI3FSiPamkRbdehoxGezQa8sunPYYuqKDmwZPKhsmqZDeBOSmgkZPhhg00hcETCYXE'); // Replace with your actual Stripe secret key

// Cloud Function to create a payment intent using Stripe
exports.createPaymentIntent = onCall(async (data, context) => {
  try {
    const { totalAmount } = data;

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount, // The amount should be in the smallest currency unit (e.g., cents for USD)
      currency: 'usd',
      payment_method_types: ['card'],
    });

    // Return the client secret to the frontend
    return { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    logger.error('Error creating payment intent', error);
    // Use functions.https.HttpsError for error handling
    throw new onCall.HttpsError('internal', 'Unable to create payment intent');
  }
});
