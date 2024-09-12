import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { functions } from '../config/firebase';
import { useDispatch } from 'react-redux';
import { httpsCallable } from 'firebase/functions';
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
    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
      return;
    }

    // Call Firebase function to create a payment intent
    const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
    try {
      const { data } = await createPaymentIntent({ totalAmount: bookingDetails.totalPrice });
      const { clientSecret } = data;

      // Confirm card payment
      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      });

      if (confirmError) {
        setError(confirmError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        setSuccess(true);

        // Dispatch booking creation after payment success
        dispatch(createBooking(bookingDetails));
      }
    } catch (err) {
      setError('Failed to create payment intent.');
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
