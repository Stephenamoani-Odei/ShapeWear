import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../utils/supabase';
import { Product } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { ErrorBoundary } from '../components/ErrorBoundary';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Search, Filter, X } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');

  // ─── Fetch products from Supabase ──────────────────────────────────────────
  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id');

      if (error) {
        setError('Failed to load products. Please try again.');
        console.error('Supabase error:', error.message);
      } else {
        // Map snake_case DB columns → camelCase Product shape
        const mapped: Product[] = (data ?? []).map((row) => ({
          id: row.id,
          name: row.name,
          price: row.price,
          image: row.image,
          category: row.category,
          description: row.description,
          features: row.features ?? [],
          colors: row.colors ?? [],
          inStock: row.in_stock,
          averageRating: row.average_rating ?? undefined,
          reviewCount: row.review_count ?? undefined,
        }));
        setProducts(mapped);

        // Set price range ceiling based on actual data
        if (mapped.length > 0) {
          const max = Math.max(...mapped.map((p) => p.price));
          setPriceRange([0, max]);
        }
      }

      setLoading(false);
    }

    fetchProducts();
  }, []);

  const categories = ['All', ...new Set(products.map((p) => p.category))];
  const maxPrice = products.length > 0 ? Math.max(...products.map((p) => p.price)) : 200;

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice =
          product.price >= priceRange[0] && product.price <= priceRange[1];
        const matchesStock = !inStockOnly || product.inStock;
        return matchesCategory && matchesSearch && matchesPrice && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [products, selectedCategory, searchQuery, priceRange, inStockOnly, sortBy]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setPriceRange([0, maxPrice]);
    setInStockOnly(false);
  };

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen pt-16 sm:pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // ─── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen pt-16 sm:pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary context="Shop Page">
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div data-aos="fade-up" className="text-center mb-12">
          <h1 className="mb-4">Shop Fit Wear for Women &amp; Men</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover premium training apparel with multiple colors and modern performance fits.
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div data-aos="fade-up" className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Filter Toggle Button (mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors lg:hidden"
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <div className="bg-gray-50 p-4 lg:p-6 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="font-semibold text-lg">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-black flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          selectedCategory === category
                            ? 'bg-black text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range: {formatCurrency(priceRange[0])} – {formatCurrency(priceRange[1])}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]])
                      }
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])])
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Stock Filter */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">In stock only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div data-aos="fade-up" className="mb-8">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
            <div key={product.id} data-aos="fade-up" data-aos-delay={index * 50}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600">No products found. Try adjusting your filters.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-black underline text-sm hover:no-underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
}
