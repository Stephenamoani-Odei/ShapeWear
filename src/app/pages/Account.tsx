import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { User, Package, Settings, LogOut } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { formatCurrency } from '../utils/currency';

export function Account() {
  const { user, logout, orders } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });

    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 data-aos="fade-up" className="mb-6sm:mb-12">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile */}
          <div data-aos="fade-up" data-aos-delay="0">
            <div className="bg-white p-8 sm:p-8 border border-gray-200">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-center mb-2">{user.name}</h2>
              <p className="text-center text-gray-600 text-sm mb-6">{user.email}</p>
              <button className="w-full border-2 border-black px-6 py-3 font-semibold hover:bg-black hover:text-white transition-colors">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Orders */}
          <div data-aos="fade-up" data-aos-delay="100">
            <div className="bg-white p-8 border border-gray-200">
              <div className="flex items-center mb-6">
                <Package className="w-6 h-6 mr-2" />
                <h3 className="font-semibold">Order History</h3>
              </div>

              {orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="border border-gray-200 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-sm">Order #{order.id}</p>
                          <p className="text-xs text-gray-600">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {formatCurrency(order.total)}
                      </p>
                      <button className="text-sm text-black hover:underline">
                        View Details
                      </button>
                    </div>
                  ))}
                  {orders.length > 3 && (
                    <button className="w-full mt-4 border-2 border-gray-300 px-4 py-2 font-semibold hover:border-gray-400 transition-colors text-sm">
                      View All Orders ({orders.length})
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No orders yet</p>
                  <button
                    onClick={() => navigate('/shop')}
                    className="text-black hover:underline text-sm"
                  >
                    Start shopping
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div data-aos="fade-up" data-aos-delay="200">
            <div className="bg-white p-8 border border-gray-200 h-full">
              <div className="flex items-center mb-4">
                <Settings className="w-6 h-6 mr-2" />
                <h3 className="font-semibold">Account Settings</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Manage your account preferences
              </p>
              <button className="w-full border-2 border-gray-300 px-6 py-3 font-semibold hover:border-gray-400 transition-colors">
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div data-aos="fade-up" className="mt-8 text-center">
          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
