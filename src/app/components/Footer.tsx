import { Link } from 'react-router';
import { Linkedin, Facebook, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">HW</span>
              </div>
              <span className="text-xl font-bold tracking-tight">SHAPEWEAR</span>
            </div>
            <p className="text-sm text-gray-600">
              Premium fitness and wellness equipment for your journey to better health.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/shop" className="hover:text-black transition-colors">
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              
              
              <li>
                <a href="/ordertracker" className="hover:text-black transition-colors">
                  Track Order
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-black transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/about" className="hover:text-black transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-black transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">
            © 2026 SHAPEWEAR. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href="https://www.linkedin.com/in/stephen-odei-amoani-42a99b343/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BL9xoCNwzTfuOmFJifD3Wgg%3D%3D" className="text-gray-600 hover:text-black transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-600 hover:text-black transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://x.com/home" className="text-gray-600 hover:text-black transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
