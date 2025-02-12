import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useDispatch } from 'react-redux';
import { createBooking } from '../redux/slices/bookingSlice';

const CheckoutForm = ({ bookingDetails }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe.js has not loaded yet.');
      setLoading(false);
      return;
    }

    if (!bookingDetails || typeof bookingDetails !== 'object' || !bookingDetails.totalPrice || bookingDetails.totalPrice <= 0) {
      setError("Invalid booking details. Please refresh and try again.");
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: bookingDetails.totalPrice }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

      const { clientSecret } = await response.json();
      if (!clientSecret) throw new Error("Failed to create payment intent.");

      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: bookingDetails.userName || 'Guest' },
        },
      });

      if (confirmError) throw new Error(confirmError.message);

      if (paymentIntent.status === 'succeeded') {
        setSuccess(true);
        dispatch(createBooking(bookingDetails));
      }
    } catch (err) {
      console.error("Payment error:", err.message);
      setError(err.message || 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-center mb-4">Payment Details</h2>
      <div className="border p-4 rounded-md">
        <CardElement className="p-2 border rounded-md" />
      </div>
      {error && <div className="text-red-500 mt-2 text-center">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="block w-full p-2 mt-4 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition duration-200"
      >
        {loading ? 'Processing...' : 'Confirm and Pay'}
      </button>
      {success && <div className="text-green-500 mt-4 text-center">Payment successful! Booking confirmed.</div>}
    </form>
  );
};

export default CheckoutForm;
