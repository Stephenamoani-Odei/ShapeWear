import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Shop } from './Shop';

const mockUseProducts = vi.fn();

vi.mock('../hooks/useProducts', () => ({
  useProducts: () => mockUseProducts(),
}));

vi.mock('../components/ProductCard', () => ({
  ProductCard: ({ product }: { product: { name: string } }) => <div>{product.name}</div>,
}));

vi.mock('aos', () => ({
  default: { init: vi.fn() },
}));

describe('Shop', () => {
  beforeEach(() => {
    mockUseProducts.mockReset();
  });

  it('renders only the products supplied by the shared catalog hook', () => {
    const products = Array.from({ length: 12 }, (_, index) => ({
      id: index + 1,
      name: `Product ${index + 1}`,
      price: 50 + index,
      image: '',
      category: 'Shapewear',
      description: 'Supportive shapewear',
      features: [],
      colors: [],
      inStock: true,
    }));

    mockUseProducts.mockReturnValue({ products, loading: false, error: null });

    render(<Shop />);

    expect(screen.getByText('Showing 12 of 12 products')).toBeInTheDocument();
    expect(screen.getAllByText(/^Product \d+$/)).toHaveLength(12);
  });
});
