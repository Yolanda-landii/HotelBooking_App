import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";
import { createBooking } from '../redux/slices/bookingSlice';

const CheckoutForm = () => {
  const stripe = useStripe();
  const location = useLocation();
  const elements = useElements();
  const dispatch = useDispatch();
  const { bookingDetails = {} } = location.state || {};
  
  console.log("Booking Details:", bookingDetails);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // const [bookingCreated, setBookingCreated] = useState(false);

  useEffect(() => {
    if (error) console.error("Payment Error:", error);
  }, [error]);

  useEffect(() => {
    if (!bookingDetails) {
      console.warn("Booking details are missing!");
    } else {
      console.log("Booking Details:", bookingDetails);
    }
  }, [bookingDetails]);
  console.log("Parent Booking Details:", bookingDetails);

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
      console.error("Invalid Booking Details:", bookingDetails);
      setError("Invalid booking details. Please refresh and try again.");
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      const response = await fetch("http://localhost:3002/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: bookingDetails.totalPrice * 100 }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.clientSecret) throw new Error("Failed to create payment intent.");

      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(data.clientSecret, {
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
      console.error("Payment Error:", err.message);
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
