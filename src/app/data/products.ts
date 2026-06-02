import { Product } from '../context/AppContext';
import img1 from '../../images/img1.webp';
import img2 from '../../images/img2.webp';
import img3 from '../../images/img3.webp';
import img4 from '../../images/img4.webp';
import img5 from '../../images/img5.jpg';
import img6 from '../../images/img6.jpg';
import img7 from '../../images/img7.jpg';
import img8 from '../../images/img8.jpg';
import img9 from '../../images/img9.jpg';
import img10 from '../../images/img10.webp';
import img11 from '../../images/img11.webp';
import img12 from '../../images/img12.jpg';

export const products: Product[] = [
  {
    id: 1,
    name: "Women's Sculpt Leggings",
    price: 64.99,
    image: img1,
    category: 'Women',
    description: 'High-waisted sculpting leggings with four-way stretch and sweat-wicking comfort.',
    features: [
      'High-waisted fit',
      'Moisture-wicking fabric',
      'Supportive compression',
      'Flatlock seams',
      'Perfect for gym or daily wear',
    ],
    colors: ['Black', 'Navy', 'Rose', 'Olive'],
    inStock: true,
    reviews: [
      {
        id: 1,
        userId: '1',
        userName: 'Sarah M.',
        rating: 5,
        comment: 'These leggings are amazing! Great fit and very comfortable for workouts.',
        date: '2024-01-15'
      },
      {
        id: 2,
        userId: '2',
        userName: 'Emily R.',
        rating: 4,
        comment: 'Love the compression and the material is high quality. Would buy again.',
        date: '2024-01-20'
      }
    ],
    averageRating: 4.5,
    reviewCount: 2,
  },
  {
    id: 2,
    name: "Men's Performance Tee",
    price: 39.99,
    image: img5,
    category: 'Men',
    description: 'Lightweight performance tee engineered for breathability and fast-dry training sessions.',
    features: [
      'Anti-odor finish',
      'Breathable mesh panels',
      'Stretch fit',
      'Tag-free comfort',
      'Reflective logo details',
    ],
    colors: ['Black', 'White', 'Graphite', 'Sky Blue', 'Red'],
    inStock: true,
    reviews: [
      {
        id: 3,
        userId: '3',
        userName: 'Mike T.',
        rating: 5,
        comment: 'Perfect fit and great quality. The material is breathable and comfortable.',
        date: '2024-01-10'
      }
    ],
    averageRating: 5,
    reviewCount: 1,
  },
  {
    id: 3,
    name: "Women's Seamless Sports Bra",
    price: 49.99,
    image: img2,
    category: 'Women',
    description: 'Seamless medium-impact sports bra with molded cups and adjustable straps.',
    features: [
      'Seamless construction',
      'Removable pads',
      'Adjustable straps',
      'Supportive band',
      'Soft breathable knit',
    ],
    colors: ['Black', 'Champagne', 'Lavender', 'Deep Teal'],
    inStock: true,
  },
  {
    id: 4,
    name: "Men's Compression Joggers",
    price: 69.99,
    image: img6,
    category: 'Men',
    description: 'Compression joggers with tapered leg and secure pockets for training and recovery.',
    features: [
      'Compression support',
      'Secure zip pockets',
      'Breathable knit',
      'Tapered ankle',
      'Elastic waist with drawcord',
    ],
    colors: ['Charcoal', 'Black', 'Forest Green', 'Navy'],
    inStock: true,
  },
  {
    id: 5,
    name: "Women's Training Tank",
    price: 34.99,
    image: img3,
    category: 'Women',
    description: 'Stretch training tank with breathable back panel and quick-dry performance.',
    features: [
      'Breathable back panel',
      'Racerback design',
      'Quick-dry fabric',
      'Lightweight feel',
      'Ideal for studio or outdoor workouts',
    ],
    colors: ['White', 'Sage', 'Coral', 'Black'],
    inStock: true,
  },
  {
    id: 6,
    name: "Men's Lightweight Hoodie",
    price: 79.99,
    image: img7,
    category: 'Men',
    description: 'Ultra-soft pullover hoodie with breathable fabric and a slim fit for layering.',
    features: [
      'Lightweight fleece',
      'Drop shoulder fit',
      'Front kangaroo pocket',
      'Ribbed cuffs and hem',
      'Perfect for warmups',
    ],
    colors: ['Black', 'Heather Gray', 'Navy', 'Maroon'],
    inStock: true,
  },
  {
    id: 7,
    name: "Women's Mesh Running Shorts",
    price: 54.99,
    image: img4,
    category: 'Women',
    description: 'Breathable running shorts with mesh ventilation and an internal liner.',
    features: [
      'Mesh ventilation',
      'Internal liner',
      'Side pockets',
      'Elastic waistband',
      'Reflective trim',
    ],
    colors: ['Black', 'Blush', 'Cobalt', 'Silver'],
    inStock: true,
  },
  {
    id: 8,
    name: "Men's Stretch Flex Shorts",
    price: 44.99,
    image: img8,
    category: 'Men',
    description: 'Stretch flex shorts with quick-dry material and an athletic fit for training.',
    features: [
      '4-way stretch',
      'Quick-dry material',
      'Hidden waistband pocket',
      'Lightweight construction',
      'Chafe-free seams',
    ],
    colors: ['Black', 'Graphite', 'Olive', 'Burgundy'],
    inStock: true,
  },
  {
    id: 9,
    name: "Women's Power Jacket",
    price: 89.99,
    image: img10,
    category: 'Women',
    description: 'Wind-resistant jacket designed for outdoor workouts with a flattering feminine cut.',
    features: [
      'Windproof fabric',
      'Slim silhouette',
      'Adjustable hood',
      'Thumbholes',
      'Packable design',
    ],
    colors: ['Black', 'Rose Gold', 'Midnight Blue', 'Gray'],
    inStock: true,
  },
  {
    id: 10,
    name: "Men's Core Compression Shirt",
    price: 59.99,
    image: img12,
    category: 'Men',
    description: 'Core compression shirt providing support and moisture control for intense training.',
    features: [
      'Compression fit',
      'Mesh side panels',
      'Flatlock seams',
      'Fast-dry fabric',
      'Enhanced mobility',
    ],
    colors: ['Black', 'White', 'Steel', 'Navy'],
    inStock: false,
  },
  {
    id: 11,
    name: 'Unisex Training Socks',
    price: 19.99,
    image: img9,
    category: 'Unisex',
    description: 'Cushioned training socks with arch support and breathable mesh zones.',
    features: [
      'Cushioned sole',
      'Arch support',
      'Breathable mesh',
      'Seamless toe',
      'Durable knit',
    ],
    colors: ['Black', 'White', 'Gray', 'Mint'],
    inStock: true,
  },
  {
    id: 12,
    name: 'Unisex Gym Hoodie',
    price: 69.99,
    image: img11,
    category: 'Unisex',
    description: 'Soft and versatile gym hoodie for pre- and post-workout comfort.',
    features: [
      'Brushed interior',
      'Relaxed fit',
      'Kangaroo pocket',
      'Adjustable drawcord hood',
      'Fade-resistant colors',
    ],
    colors: ['Black', 'Charcoal', 'Navy', 'Plum'],
    inStock: true,
  },
];
