import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Trash2, ShoppingBag } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { formatCurrency } from '../utils/currency';

export function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
  }, []);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Add some products to get started
            </p>
            <Link
              to="/shop"
              className="inline-block px-8 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 data-aos="fade-up" className="mb-12">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cart.map((item, index) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className="flex gap-4 p-4 sm:gap-6 sm:p-6 bg-white border border-gray-200"
                >
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 sm:w-32 sm:h-32 object-cover flex-shrink-0"
                  />

                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        {item.size && (
                          <p className="text-sm text-gray-500">Size: {item.size}</p>
                        )}
                        {item.color && (
                          <p className="text-sm text-gray-500">Color: {item.color}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.size, item.color)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                          className="w-8 h-8 border border-gray-300 hover:border-gray-400 transition-colors"
                        >
                          -
                        </button>
                        <span className="font-semibold w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                          className="w-8 h-8 border border-gray-300 hover:border-gray-400 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div
              data-aos="fade-left"
              className="bg-gray-50 p-4 sm:p-8 border border-grey-200 lg:sticky lg:top-24"
            >
              <h2 className="mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-semibold">
                    {cartTotal > 1000 ? 'FREE' : formatCurrency(10.00)}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-xl">
                      {formatCurrency(cartTotal + (cartTotal > 1000 ? 0 : 10.00))}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-black text-white py-4 font-semibold hover:bg-gray-800 transition-colors mb-4"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/shop"
                className="block text-center text-sm text-gray-600 hover:text-black transition-colors"
              >
                Continue Shopping
              </Link>

              {cartTotal > 1000 && (
                <p className="text-sm text-green-600 mt-4 text-center">
                  You qualify for free Delivery!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
