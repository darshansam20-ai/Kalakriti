export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  mrp: number;
  category: string;
  material: string;
  color: string;
  occasion: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  images: string[];
  sizes: string[];
  isBestseller: boolean;
  isNewArrival: boolean;
  shippingReturns?: string;
  careInstructions?: string;
}

export const categories = [
  { id: 'bridal-sets', name: 'Bridal Sets', image: 'https://picsum.photos/seed/bridal/400/400' },
  { id: 'silk-thread', name: 'Silk Thread', image: 'https://picsum.photos/seed/silk/400/400' },
  { id: 'kundan-stone', name: 'Kundan & Stone', image: 'https://picsum.photos/seed/kundan/400/400' },
  { id: 'daily-wear', name: 'Daily Wear', image: 'https://picsum.photos/seed/daily/400/400' },
];

export const products: Product[] = [
  {
    id: 'p1',
    title: 'Royal Kundan Bridal Set',
    description: 'Exquisite handcrafted Kundan bangle set perfect for weddings and grand occasions. Features intricate stone work on a gold-plated base.',
    price: 4500,
    mrp: 6000,
    category: 'Bridal Sets',
    material: 'Metal',
    color: 'Gold',
    occasion: 'Wedding',
    rating: 4.8,
    reviews: 124,
    inStock: true,
    images: [
      'https://picsum.photos/seed/bangle1/800/800',
      'https://picsum.photos/seed/bangle1b/800/800',
      'https://picsum.photos/seed/bangle1c/800/800',
    ],
    sizes: ['2.2', '2.4', '2.6', '2.8'],
    isBestseller: true,
    isNewArrival: false,
  },
  {
    id: 'p2',
    title: 'Maroon Silk Thread Bangles',
    description: 'Vibrant maroon silk thread bangles embellished with subtle gold beads. Lightweight and elegant for festive wear.',
    price: 850,
    mrp: 1200,
    category: 'Silk Thread',
    material: 'Silk',
    color: 'Maroon',
    occasion: 'Festive',
    rating: 4.5,
    reviews: 89,
    inStock: true,
    images: [
      'https://picsum.photos/seed/bangle2/800/800',
      'https://picsum.photos/seed/bangle2b/800/800',
    ],
    sizes: ['2.4', '2.6'],
    isBestseller: true,
    isNewArrival: true,
  },
  {
    id: 'p3',
    title: 'Classic Gold-Plated Kadas',
    description: 'A pair of traditional gold-plated kadas with intricate floral motifs. Perfect for daily wear or pairing with other bangles.',
    price: 1200,
    mrp: 1500,
    category: 'Daily Wear',
    material: 'Metal',
    color: 'Gold',
    occasion: 'Casual',
    rating: 4.2,
    reviews: 45,
    inStock: true,
    images: [
      'https://picsum.photos/seed/bangle3/800/800',
      'https://picsum.photos/seed/bangle3b/800/800',
    ],
    sizes: ['2.2', '2.4', '2.6', '2.8'],
    isBestseller: false,
    isNewArrival: false,
  },
  {
    id: 'p4',
    title: 'Pastel Meenakari Chura',
    description: 'Elegant pastel pink and mint green meenakari work bangles. Adds a soft, sophisticated touch to any ethnic outfit.',
    price: 2800,
    mrp: 3500,
    category: 'Bridal Sets',
    material: 'Glass',
    color: 'Pastel',
    occasion: 'Wedding',
    rating: 4.9,
    reviews: 210,
    inStock: true,
    images: [
      'https://picsum.photos/seed/bangle4/800/800',
      'https://picsum.photos/seed/bangle4b/800/800',
    ],
    sizes: ['2.4', '2.6', '2.8'],
    isBestseller: true,
    isNewArrival: true,
  },
  {
    id: 'p5',
    title: 'Oxidized Silver Tribal Bangles',
    description: 'Chunky oxidized silver bangles with tribal-inspired geometric patterns. Great for a boho-chic look.',
    price: 950,
    mrp: 1400,
    category: 'Daily Wear',
    material: 'Metal',
    color: 'Silver',
    occasion: 'Casual',
    rating: 4.6,
    reviews: 67,
    inStock: true,
    images: [
      'https://picsum.photos/seed/bangle5/800/800',
    ],
    sizes: ['2.4', '2.6'],
    isBestseller: false,
    isNewArrival: true,
  },
  {
    id: 'p6',
    title: 'Ruby Red Stone Studded Set',
    description: 'Dazzling bangle set featuring deep ruby red stones set in a gold-finish frame. A showstopper for evening events.',
    price: 3200,
    mrp: 4000,
    category: 'Kundan & Stone',
    material: 'Metal',
    color: 'Red',
    occasion: 'Party',
    rating: 4.7,
    reviews: 156,
    inStock: false,
    images: [
      'https://picsum.photos/seed/bangle6/800/800',
      'https://picsum.photos/seed/bangle6b/800/800',
    ],
    sizes: ['2.2', '2.4', '2.6'],
    isBestseller: true,
    isNewArrival: false,
  }
];
