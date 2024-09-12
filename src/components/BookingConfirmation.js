import React from 'react';
import { useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

// Load your publishable Stripe key
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const BookingConfirmation = () => {
  const location = useLocation();
  const { bookingDetails } = location.state || {};

  if (!bookingDetails) {
    return <div>No booking details available.</div>;
  }

  const { checkin, checkout, guests, totalPrice, hotelName, nights } = bookingDetails;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Confirm Your Booking</h2>

      {/* Booking Summary */}
      <div className="border p-4 mb-4">
        <h3 className="text-xl font-semibold mb-2">Your Trip</h3>
        <p>Hotel: {hotelName}</p>
        <p>Dates: {checkin} - {checkout}</p>
        <p>
          Guests: {guests.adults} Adults, {guests.children} Children, {guests.infants} Infants, {guests.pets} Pets
        </p>
        <p>Nights: {nights}</p>
      </div>

      {/* Price Summary */}
      <div className="border p-4 mb-4">
        <h3 className="text-xl font-semibold mb-2">Price Details</h3>
        <p>Room price x {nights} nights: {totalPrice.toFixed(2)} ZAR</p>
        {/* Add more price details if needed */}
        <p>Total: {totalPrice.toFixed(2)} ZAR</p>
      </div>

      {/* Stripe Payment Form */}
      <Elements stripe={stripePromise}>
        <CheckoutForm bookingDetails={bookingDetails} />
      </Elements>
    </div>
  );
};

export default BookingConfirmation;
