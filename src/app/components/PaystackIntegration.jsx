import React from 'react';
import { usePaystackPayment } from 'react-paystack';
import { ErrorBoundary } from './ErrorBoundary';

const PaystackCheckout = () => {
  //  Configure the payment options
  const config = {
    reference: (new Date()).getTime().toString(), 
    email: "customer@example.com",
    amount: 5000, 
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY, 
    currency: 'GHS', 
  };

  //  Define success and close callbacks
  const onSuccess = (reference) => {
    // Implementation for what happens after a successful payment
    console.log("Payment Successful! Reference:", reference);
    alert(`Thank you! Transaction Reference: ${reference.reference}`);
  };

  const onClose = () => {
    // Implementation for what happens if the user closes the modal
    console.log("Payment modal closed by user.");
    alert("Payment cancelled.");
  };

  //  Initialize the hook
  const initializePayment = usePaystackPayment(config);

  return (
    <ErrorBoundary context="Paystack Payment">
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Checkout Form</h2>
      <p>Total Amount: ₵5,000</p>
      <button 
        onClick={() => initializePayment(onSuccess, onClose)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#3bb75e',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Pay with Paystack
      </button>
    </div>
    </ErrorBoundary>
  );
};

export default PaystackCheckout;