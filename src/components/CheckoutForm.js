import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useDispatch } from 'react-redux';
import { useLocation,useNavigation } from "react-router-dom";
import { createBooking } from '../redux/slices/bookingSlice';

const CheckoutForm = () => {
  const stripe = useStripe();
  const navigate = useNavigation()
  const location = useLocation();
  const elements = useElements();
  const dispatch = useDispatch();
  const { bookingDetails = {} } = location.state || {};

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (error) console.error("Payment Error:", error);
  }, [error]);

  useEffect(() => {
    if (!bookingDetails) {
      console.warn("Booking details are missing!");
    }
  }, [bookingDetails]);

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
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      console.error("Payment Error:", err.message);
      setError(err.message || 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-8 bg-gray-100 shadow-lg rounded-lg mt-10"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Payment Details
      </h2>
      <div className="p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
        <CardElement
          className="p-3 border border-gray-200 rounded-md focus:border-blue-500 transition duration-200"
        />
      </div>
      {error && (
        <div className="text-red-600 mt-4 text-sm text-center">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className={`block w-full py-3 mt-6 text-white font-semibold rounded-lg transition duration-300 ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Processing...' : 'Confirm and Pay'}
      </button>
      {success && (
        <div className="text-green-600 mt-6 text-center text-lg font-semibold">
          Payment successful! Booking confirmed.
        </div>
      )}
    </form>
  );
};

export default CheckoutForm;
