import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Product } from '../context/AppContext';

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
      }
      if (typeof parsed === 'string' && parsed.trim()) {
        return [parsed.trim()];
      }
    } catch {
      // Fall back to comma-separated parsing.
    }

    return trimmed
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

// Maps a Supabase `products` row (snake_case) to the app's Product shape (camelCase)
export function mapRow(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    image: row.image ?? '',
    category: row.category,
    description: row.description,
    features: normalizeStringArray(row.features),
    colors: normalizeStringArray(row.colors),
    inStock: Boolean(row.in_stock),
    averageRating: row.average_rating ?? undefined,
    reviewCount: row.review_count ?? undefined,
  };
}

/**
 * Fetches ALL products from Supabase. Use this on pages that need the
 * full catalog (Shop, Home, Admin).
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id');

      if (!isMounted) return;

      if (error) {
        setError('Failed to load products. Please try again.');
        console.error('Supabase error:', error.message);
      } else {
        setProducts((data ?? []).map(mapRow));
      }

      setLoading(false);
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return { products, loading, error };
}

/**
 * Fetches a SINGLE product by id from Supabase. Use this on pages that
 * only need one product (ProductDetail).
 */
export function useProduct(id: number | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === undefined || Number.isNaN(id)) {
      setProduct(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchProduct() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        setError('Failed to load product. Please try again.');
        console.error('Supabase error:', error.message);
        setProduct(null);
      } else {
        setProduct(data ? mapRow(data) : null);
      }

      setLoading(false);
    }

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { product, loading, error };
}
