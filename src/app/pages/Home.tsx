import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Shield, Truck, Heart } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { products } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import bg1 from '../../images/bg1.jpg';
import img4 from '../../images/img4.webp';
import { motion } from 'motion/react';

export function Home() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out',
    });
  }, []);

  // Add structured data for SEO
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "SHAPEWEAR",
      "url": "https://shapewear.com",
      "logo": "https://shapewear.com/logo.png",
      "description": "Premium fitness apparel and shapewear for women and men",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-555-123-4567",
        "contactType": "customer service"
      },
      "sameAs": [
        "https://facebook.com/shapewear",
        "https://instagram.com/shapewear",
        "https://twitter.com/shapewear"
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src={bg1}
            alt="Fitness lifestyle"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-white mb-6">
              Transform Your Fitness Journey
            </h1>
            <p className="text-white/90 text-xl mb-8 max-w-lg">
              Premium equipment and gear designed for athletes who demand excellence.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 bg-white text-black px-8 py-4 font-semibold hover:bg-gray-100 transition-colors"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div data-aos="fade-up" data-aos-delay="0" className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                  <Truck className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600">On orders over $100</p>
            </div>

            <div data-aos="fade-up" data-aos-delay="100" className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">100% secure transactions</p>
            </div>

            <div data-aos="fade-up" data-aos-delay="200" className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">Premium products only</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-aos="fade-up" className="text-center mb-12">
            <h2 className="mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our most popular fitness essentials
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div data-aos="fade-up" className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 border-2 border-black px-8 py-4 font-semibold hover:bg-black hover:text-white transition-colors"
            >
              <span>View All Products</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div data-aos="fade-right">
              <ImageWithFallback
                src={img4}
                alt="Training"
                className="w-full h-[500px] object-cover"
              />
            </div>
            <div data-aos="fade-left">
              <h2 className="mb-6">Built for Athletes, By Athletes</h2>
              <p className="text-gray-600 mb-6">
                Every product we create is tested by professional athletes and fitness
                enthusiasts. We understand what it takes to perform at your best because
                we've been there.
              </p>
              <p className="text-gray-600 mb-8">
                From cutting-edge technology to sustainable materials, we're committed to
                delivering excellence in every detail.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center space-x-2 font-semibold hover:text-gray-600 transition-colors"
              >
                <span>Learn More About Us</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div data-aos="fade-up">
            <h2 className="text-white mb-4">Join the SHAPEWEAR Community</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Get exclusive access to new products, training tips, and special offers.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubscribe = () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error');
      return;
    }
    // In production, call your email marketing API here
    setStatus('success');
    setEmail('');
  };

  if (status === 'success') {
    return <p className="text-green-400 font-semibold text-lg">Thanks for subscribing! 🎉</p>;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md w-full mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
          placeholder="Enter your email"
          className="px-6 py-3 bg-white text-black flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
        />
        <button
          onClick={handleSubscribe}
          className="px-8 py-3 bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
        >
          Subscribe
        </button>
      </div>
      {status === 'error' && (
        <p className="text-red-400 text-sm">Please enter a valid email address.</p>
      )}
    </div>
  );
}
