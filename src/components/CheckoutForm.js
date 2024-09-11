import React, { useState } from 'react';
import { functions } from '../config/firebase';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = ({ bookingDetails }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    const createPaymentIntent = async (totalAmount) => {
        const createPaymentIntentFn = functions.httpsCallable('createPaymentIntent');
        const result = await createPaymentIntentFn({ totalAmount });
        return result.data;
      };
    // Call backend to create payment intent (not covered here)
    const { clientSecret } = await createPaymentIntent(bookingDetails.totalPrice); // Mocked function

    const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod.id,
    });

    if (confirmError) {
      setError(confirmError.message);
    } else if (paymentIntent.status === 'succeeded') {
      setSuccess(true);
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
      {success && <div className="text-green-500 mt-4">Payment successful!</div>}
    </form>
  );
};

export default CheckoutForm;
