import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import Navigation from './Navigation';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get booking details from location state
  const { bookingDetails } = location.state || {};

  useEffect(() => {
    // If no booking details, redirect to home
    if (!bookingDetails) {
      navigate('/');
    }
  }, [bookingDetails, navigate]);

  // Check for existing booking
  const checkExistingBooking = async () => {
    if (!bookingDetails?.userId || !bookingDetails?.roomId) return false;

    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('userId', '==', bookingDetails.userId),
      where('roomId', '==', bookingDetails.roomId),
      where('checkin', '==', bookingDetails.checkin),
      where('checkout', '==', bookingDetails.checkout)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  if (!bookingDetails) {
    return (
      <div className="min-h-screen">
        <div className="fixed top-0 w-full z-50">
          <Navigation />
        </div>
        <div className="pt-16 bg-gray-100 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error: Booking details not found. Redirecting...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check for existing booking before processing payment
      const hasExistingBooking = await checkExistingBooking();
      if (hasExistingBooking) {
        throw new Error('You already have a booking for these dates. Please check your bookings page.');
      }

      // Create a payment intent with Stripe
      const response = await fetch('http://localhost:3002/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: bookingDetails.totalPrice * 100,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      
      // Process payment
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Double check for existing booking before creating new one
        const stillHasExistingBooking = await checkExistingBooking();
        if (stillHasExistingBooking) {
          throw new Error('A booking was created while processing your payment. Please check your bookings page.');
        }

        // Create the booking in Firestore
        await addDoc(collection(db, 'bookings'), {
          ...bookingDetails,
          paymentIntentId: paymentIntent.id,
          paymentStatus: 'paid',
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        
        setSuccess(true);
        
        // Redirect to bookings page after 2 seconds
        setTimeout(() => {
          navigate('/bookings');
        }, 2000);
      }
    } catch (err) {
      console.error('Error during checkout:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="fixed top-0 w-full z-50">
        <Navigation />
      </div>
      <div className="pt-16 bg-gray-100 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Complete Your Booking</h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Your Trip</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p><span className="font-semibold">Hotel:</span> {bookingDetails.hotelName}</p>
                <p><span className="font-semibold">Check-in:</span> {new Date(bookingDetails.checkin).toLocaleDateString()}</p>
                <p><span className="font-semibold">Check-out:</span> {new Date(bookingDetails.checkout).toLocaleDateString()}</p>
                <p><span className="font-semibold">Guests:</span> {bookingDetails.guests.adults + bookingDetails.guests.children} total</p>
                <p className="text-lg font-semibold mt-2">Total: R{bookingDetails.totalPrice}</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Payment successful! Redirecting to your bookings...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-4 border border-gray-300 rounded-md">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!stripe || loading || success}
                className={`w-full py-2 rounded-md text-white font-bold ${
                  loading || success ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {loading ? 'Processing...' : 
                 success ? 'Payment Successful!' : 
                 `Pay R${bookingDetails.totalPrice}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
