import { Link } from 'react-router';
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function Header() {
  const { cartCount, user, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" aria-label="Home page">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">HW</span>
            </div>
            <span className="text-xl font-bold tracking-tight">SHAPEWEAR</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
            <Link to="/shop" className="hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 px-2 py-1 rounded">
              Shop
            </Link>
            <Link to="/about" className="hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 px-2 py-1 rounded">
              About
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              className=" hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 p-1 rounded"
              aria-label="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {user ? (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/account"
                  className="hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 p-1 rounded"
                  aria-label="Go to account page"
                >
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={logout}
                  className="text-sm hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 px-2 py-1 rounded"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:block hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 p-1 rounded"
                aria-label="Login to your account"
              >
                <User className="w-5 h-5" />
              </Link>
            )}

            <Link
              to="/cart"
              className="relative hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 p-1 rounded"
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 p-1 rounded"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 bg-white"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="px-4 py-4 space-y-3">
              <Link
                to="/shop"
                className="block py-2 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 px-2 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                to="/about"
                className="block py-2 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 px-2 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              {user ? (
                <>
                  <Link
                    to="/account"
                    className="block py-2 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 px-2 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Account
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="block py-2 hover:text-gray-600 transition-colors text-left w-full focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 px-2 rounded"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block py-2 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 px-2 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
