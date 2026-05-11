import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { products } from '../data/products';
import { useApp } from '../context/AppContext';
import { Check, ShoppingCart } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ReviewSection } from '../components/ReviewSection';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast } from 'sonner';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getProductReviews } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('');

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  const product = products.find((p) => p.id === Number(id));

  useEffect(() => {
    if (product && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mb-4">Product Not Found</h1>
          <button
            onClick={() => navigate('/shop')}
            className="px-8 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    toast.success('Added to cart!');
  };

  const sizes = ['S', 'M', 'L', 'XL'];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div data-aos="fade-right">
            <div className="aspect-square bg-gray-100 overflow-hidden sticky top-24">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div data-aos="fade-left">
            <div className="lg:sticky lg:top-24">
              <p className="text-sm text-gray-500 mb-2">{product.category}</p>
              <h1 className="mb-4">{product.name}</h1>
              <p className="text-3xl font-bold mb-6">${product.price.toFixed(2)}</p>

              <p className="text-gray-600 mb-8">{product.description}</p>

              {/* Features */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Size</h3>
                <div className="flex space-x-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 border-2 font-semibold transition-colors ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {product.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-full font-medium transition-colors ${
                          selectedColor === color
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-8">
                <h3 className="font-semibold mb-3">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    -
                  </button>
                  <span className="font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`w-full flex items-center justify-center space-x-2 px-8 py-4 font-semibold transition-colors ${
                  product.inStock
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
              </button>

              {/* Stock Status */}
              {product.inStock && (
                <p className="text-sm text-green-600 mt-4 flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>In Stock - Ships within 2-3 business days</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSection
          productId={product.id}
          reviews={getProductReviews(product.id, product.reviews)}
          averageRating={product.averageRating}
          reviewCount={product.reviewCount}
        />
      </div>
    </div>
  );
}
