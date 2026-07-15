import { Link } from 'react-router';
import { Product } from '../context/AppContext';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/currency';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useApp();
  const isWishlisted = isInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  return (
    <Link to={`/product/${product.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group cursor-pointer relative"
      >
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isWishlisted
                ? 'fill-red-500 text-red-500'
                : 'text-gray-600 hover:text-red-500'
            }`}
          />
        </button>

        <div className="relative aspect-square overflow-hidden bg-gray-100 mb-4">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">{product.category}</p>
          <h3 className="font-semibold mb-2 group-hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
          <p className="font-semibold">{formatCurrency(product.price)}</p>
        </div>
      </motion.div>
    </Link>
  );
}
