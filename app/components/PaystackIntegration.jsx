import React from 'react';
import { usePaystackPayment } from 'react-paystack';

const PaystackCheckout = () => {
  // 1. Configure the payment options
  const config = {
    reference: (new Date()).getTime().toString(), 
    email: "customer@example.com",
    amount: 5000, 
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY, 
    currency: 'GHS', 
  };

  // 2. Define success and close callbacks
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

  // 3. Initialize the hook
  const initializePayment = usePaystackPayment(config);

  return (
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
  );
};

export default PaystackCheckout;