import { describe, it, expect } from 'vitest';
import { mapRow } from './useProducts';

describe('mapRow', () => {
  it('normalizes string-based features and colors into arrays', () => {
    const mapped = mapRow({
      id: 1,
      name: 'Test product',
      price: 20,
      image: '/img.jpg',
      category: 'Shapewear',
      description: 'A test product',
      features: 'Stretch,Comfort',
      colors: 'Black',
      in_stock: true,
      average_rating: 4.5,
      review_count: 10,
    });

    expect(mapped.features).toEqual(['Stretch', 'Comfort']);
    expect(mapped.colors).toEqual(['Black']);
  });

  it('parses JSON strings for features and colors', () => {
    const mapped = mapRow({
      id: 2,
      name: 'Test product 2',
      price: 25,
      image: '/img2.jpg',
      category: 'Shapewear',
      description: 'Another test',
      features: '["Support","Soft"]',
      colors: '["White","Nude"]',
      in_stock: false,
      average_rating: undefined,
      review_count: 0,
    });

    expect(mapped.features).toEqual(['Support', 'Soft']);
    expect(mapped.colors).toEqual(['White', 'Nude']);
  });
});
