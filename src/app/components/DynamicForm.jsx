import React, { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

const MomoCheckout = () => {
  // 1. Dynamic User State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    amount: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Generate a totally unique reference prefixed with system identifiers
  const transactionRef = `momo_sup_${Date.now()}`;

  // 2. Paystack Configuration (Hardcoded to GHS for MoMo capability)
  const config = {
    reference: transactionRef,
    email: formData.email || "customer@fallback.com",
    // Paystack takes amounts in sub-units (pesewas/cents). Multiply GHS by 100
    amount: parseFloat(formData.amount || 0) * 100, 
    publicKey: 'pk_test_your_paystack_public_key',
    currency: 'GHS', 
    channels: ['mobile_money', 'card'] // explicitly prompt Mobile Money
  };

  const initializePayment = usePaystackPayment(config);

  // 3. What happens when the user clicks submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.amount) return alert("Please fill details");

    try {
      // Step A: Log the pending order to Supabase first
      const { error } = await supabase.from('orders').insert([
        {
          user_email: formData.email,
          customer_name: formData.name,
          phone_number: formData.phone,
          amount_ghs: parseFloat(formData.amount),
          paystack_reference: transactionRef,
          payment_status: 'pending'
        }
      ]);

      if (error) throw error;

      // Step B: Fire open the MoMo popup modal
      initializePayment(onSuccess, onClose);

    } catch (err) {
      console.error("Database initialization error:", err.message);
    }
  };

  const onSuccess = (reference) => {
    alert(`MoMo authorization requested! Reference: ${reference.reference}. Your order will process shortly.`);
    // Don't modify database here! Let your webhook handle it safely.
  };

  const onClose = () => {
    alert("Payment popup closed.");
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>MTN MoMo Checkout (Supabase)</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required style={inputStyle} />
        <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required style={inputStyle} />
        <input type="tel" name="phone" placeholder="MoMo Number (e.g. 024xxxxxxx)" onChange={handleChange} required style={inputStyle} />
        <input type="number" name="amount" placeholder="Amount in GHS" onChange={handleChange} required style={inputStyle} />
        <button type="submit" style={btnStyle}>Pay via Mobile Money</button>
      </form>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '10px', margin: '8px 0', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '12px', backgroundColor: '#e5c100', color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer' };

export default MomoCheckout;