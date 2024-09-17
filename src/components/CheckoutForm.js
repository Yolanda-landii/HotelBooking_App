import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useDispatch } from 'react-redux';
import { createBooking } from '../redux/slices/bookingSlice';

const CheckoutForm = ({ bookingDetails }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
  
    if (!stripe || !elements) {
      setError('Stripe.js has not loaded yet.');
      setLoading(false);
      return;
    }
  
    const cardElement = elements.getElement(CardElement);
  
    // Call to your backend to create a PaymentIntent
    try {
      const response = await fetch('http://localhost:3001/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: bookingDetails.totalPrice }) // Make sure this is valid
      });
  
      const { clientSecret } = await response.json();
  
      if (!clientSecret) {
        setError('Failed to create payment intent.');
        setLoading(false);
        return;
      }
  
      // Confirm the card payment
      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: bookingDetails.userName,
          },
        },
      });
  
      if (confirmError) {
        setError(confirmError.message);
        setLoading(false);
        return;
      }
  
      if (paymentIntent.status === 'succeeded') {
        setSuccess(true);
        dispatch(createBooking(bookingDetails));
      }
    } catch (err) {
      setError('Failed to process payment. Please try again.');
    }
  
    setLoading(false);
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="block w-full p-2 mt-4 bg-blue-500 text-white font-bold rounded-md"
      >
        {loading ? 'Processing...' : 'Confirm and Pay'}
      </button>
      {success && <div className="text-green-500 mt-4">Payment successful! Booking confirmed.</div>}
    </form>
  );
};

export default CheckoutForm;
