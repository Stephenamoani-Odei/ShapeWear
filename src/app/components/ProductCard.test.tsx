import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { ProductCard } from '../components/ProductCard';
import { AppProvider } from '../context/AppContext';

const mockProduct = {
  id: 1,
  name: "Test Product",
  price: 29.99,
  image: "test-image.jpg",
  category: "Test",
  description: "A test product",
  features: ["Feature 1", "Feature 2"],
  colors: ["Black", "White"],
  inStock: true,
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AppProvider>
        {component}
      </AppProvider>
    </BrowserRouter>
  );
};

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('renders product image with correct alt text', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'test-image.jpg');
  });

  it('links to the correct product page', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/product/1');
  });

  it('shows out of stock overlay when product is not in stock', () => {
    const outOfStockProduct = { ...mockProduct, inStock: false };
    renderWithProviders(<ProductCard product={outOfStockProduct} />);

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });
});