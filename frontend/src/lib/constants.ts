export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
export const APP_NAME = 'AncerLarins';

export const PRICE_RANGES = {
  rent: [
    { label: 'Under ₦500K', min: 0, max: 50000000 },
    { label: '₦500K - ₦1M', min: 50000000, max: 100000000 },
    { label: '₦1M - ₦2M', min: 100000000, max: 200000000 },
    { label: '₦2M - ₦5M', min: 200000000, max: 500000000 },
    { label: '₦5M+', min: 500000000, max: undefined },
  ],
  sale: [
    { label: 'Under ₦20M', min: 0, max: 2000000000 },
    { label: '₦20M - ₦50M', min: 2000000000, max: 5000000000 },
    { label: '₦50M - ₦100M', min: 5000000000, max: 10000000000 },
    { label: '₦100M - ₦300M', min: 10000000000, max: 30000000000 },
    { label: '₦300M+', min: 30000000000, max: undefined },
  ],
  short_let: [
    { label: 'Under ₦50K/night', min: 0, max: 5000000 },
    { label: '₦50K - ₦100K/night', min: 5000000, max: 10000000 },
    { label: '₦100K - ₦250K/night', min: 10000000, max: 25000000 },
    { label: '₦250K - ₦500K/night', min: 25000000, max: 50000000 },
    { label: '₦500K+/night', min: 50000000, max: undefined },
  ],
} as const;

export const BEDROOM_OPTIONS = [
  { label: 'Studio', value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5+', value: 5 },
] as const;

export const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Most Popular', value: 'popular' },
] as const;

export const POPULAR_AREAS = [
  { name: 'Lekki', slug: 'lekki', image: '/areas/lekki.jpg' },
  { name: 'Ikoyi', slug: 'ikoyi', image: '/areas/ikoyi.jpg' },
  { name: 'Victoria Island', slug: 'victoria-island', image: '/areas/vi.jpg' },
  { name: 'Yaba', slug: 'yaba', image: '/areas/yaba.jpg' },
  { name: 'Ikeja', slug: 'ikeja', image: '/areas/ikeja.jpg' },
] as const;
