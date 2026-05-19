import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Lock, CreditCard, Phone } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/currency';
import { usePaystackPayment } from 'react-paystack';
import { supabase } from '../utils/supabase';

export function Checkout() {
  const { cart, cartTotal, clearCart, user } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'card' as 'card' | 'momo',
    momoPhone: '',
  });

  const shippingCost = cartTotal > 1000 ? 0 : 9.99;
  const total = cartTotal + shippingCost;

  // ─── Paystack config ────────────────────────────────────────────────────────
  const paystackConfig = {
    reference: `order_${Date.now()}`,
    email: formData.email || 'customer@fallback.com',
    amount: Math.round(total * 100), // convert to pesewas
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    currency: 'GHS',
    channels: formData.paymentMethod === 'momo'
      ? (['mobile_money'] as string[])
      : (['card'] as string[]),
    metadata: {
      custom_fields: [
        {
          display_name: 'Customer Name',
          variable_name: 'customer_name',
          value: `${formData.firstName} ${formData.lastName}`,
        },
        {
          display_name: 'Shipping Address',
          variable_name: 'shipping_address',
          value: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
        },
      ],
    },
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  useEffect(() => {
    AOS.init({ duration: 600, once: true });
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  // ─── Input change handler ────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/[<>]/g, '');
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
  };

  // ─── Save order to Supabase after successful payment ─────────────────────────
  const saveOrder = async (reference: string) => {
    const orderItems = cart.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size ?? null,
      color: item.color ?? null,
    }));

    const { error } = await supabase.from('orders').insert([
      {
        user_email: formData.email,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        phone_number: formData.momoPhone || null,
        amount_ghs: total,
        paystack_reference: reference,
        payment_status: 'success',
        shipping_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
        items: orderItems,
      },
    ]);

    if (error) {
      console.error('Failed to save order:', error.message);
      // Payment succeeded but order save failed — still let the user proceed
      toast.warning('Payment received but order record failed to save. Please contact support.');
    }
  };

  // ─── Payment success callback ────────────────────────────────────────────────
  const onPaystackSuccess = async (reference: { reference: string }) => {
    await saveOrder(reference.reference);
    clearCart();
    toast.success('Order placed successfully! 🎉');
    navigate('/');
  };

  // ─── Payment close/cancel callback ───────────────────────────────────────────
  const onPaystackClose = () => {
    toast.error('Payment cancelled. Your cart is still saved.');
    setLoading(false);
  };

  // ─── Form submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.address) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (formData.paymentMethod === 'momo' && !/^0\d{9}$/.test(formData.momoPhone)) {
      toast.error('Please enter a valid MoMo number (e.g. 024xxxxxxxx)');
      setLoading(false);
      return;
    }

    // Open Paystack popup
    initializePayment({
      onSuccess: onPaystackSuccess,
      onClose: onPaystackClose,
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Secure badge */}
        <div data-aos="fade-up" className="flex items-center justify-center mb-8">
          <Lock className="w-5 h-5 mr-2 text-green-600" />
          <span className="text-sm text-gray-600">Secure Checkout — Powered by Paystack</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Checkout Form ──────────────────────────────────────────────── */}
          <div data-aos="fade-right">
            <div className="bg-white p-8 border border-gray-200">
              <h2 className="mb-6">Shipping Information</h2>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>

                {/* Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>

                {/* City / State */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* ZIP */}
                <div>
                  <label className="block text-sm font-semibold mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>

                {/* ── Payment Method ───────────────────────────────────────── */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Method
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {(['card', 'momo'] as const).map((method) => (
                      <button
                        type="button"
                        key={method}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, paymentMethod: method }))
                        }
                        className={`w-full px-4 py-3 border rounded text-sm font-semibold transition-colors ${
                          formData.paymentMethod === method
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                        }`}
                      >
                        {method === 'card' ? '💳 Card' : '📱 Mobile Money'}
                      </button>
                    ))}
                  </div>

                  {/* MoMo phone — only shown when momo is selected */}
                  {formData.paymentMethod === 'momo' && (
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        MoMo Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-3.5 text-gray-400 w-4 h-4" />
                        <input
                          type="tel"
                          name="momoPhone"
                          value={formData.momoPhone}
                          onChange={handleInputChange}
                          placeholder="024xxxxxxxx"
                          required
                          maxLength={10}
                          className="w-full pl-12 py-3 pr-4 border border-gray-300 focus:outline-none focus:border-black"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        You will receive a MoMo prompt on this number to confirm payment.
                      </p>
                    </div>
                  )}

                  {formData.paymentMethod === 'card' && (
                    <p className="text-sm text-gray-500">
                      You will enter your card details securely in the Paystack popup.
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-4 font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Opening payment...' : `Pay ${formatCurrency(total)}`}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Payments are processed securely by Paystack. We never store your card details.
                </p>
              </form>
            </div>
          </div>

          {/* ── Order Summary ──────────────────────────────────────────────── */}
          <div data-aos="fade-left">
            <div className="bg-white p-8 border border-gray-200 sticky top-24">
              <h2 className="mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      {item.size && (
                        <p className="text-sm text-gray-500">Size: {item.size}</p>
                      )}
                      {item.color && (
                        <p className="text-sm text-gray-500">Color: {item.color}</p>
                      )}
                    </div>
                    <p className="font-semibold text-sm">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-gray-400">
                    Free shipping on orders over {formatCurrency(1000)}
                  </p>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-xl">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
