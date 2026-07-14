import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Admin } from './Admin';

const mockUseProducts = vi.fn();

vi.mock('../hooks/useProducts', () => ({
  useProducts: () => mockUseProducts(),
}));

describe('Admin', () => {
  beforeEach(() => {
    mockUseProducts.mockReset();
  });

  it('renders products from Supabase instead of mock data', () => {
    mockUseProducts.mockReturnValue({
      products: [
        {
          id: 1,
          name: 'Leggings',
          price: 64.99,
          image: '',
          category: 'Women',
          description: 'Supportive leggings',
          features: ['high waisted'],
          colors: ['Black'],
          inStock: true,
          averageRating: 4.5,
          reviewCount: 2,
        },
      ],
      loading: false,
      error: null,
    });

    render(<Admin />);

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Leggings')).toBeInTheDocument();
    expect(screen.getByText('₵64.99')).toBeInTheDocument();
  });
});
