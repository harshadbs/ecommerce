// Order status display names and colors
export const ORDER_STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'yellow' },
  CONFIRMED: { label: 'Confirmed', color: 'blue' },
  PROCESSING: { label: 'Processing', color: 'blue' },
  PACKED: { label: 'Packed', color: 'indigo' },
  SHIPPED: { label: 'Shipped', color: 'purple' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'orange' },
  DELIVERED: { label: 'Delivered', color: 'green' },
  CANCELLED: { label: 'Cancelled', color: 'red' },
  RETURNED: { label: 'Returned', color: 'gray' },
  REFUNDED: { label: 'Refunded', color: 'gray' },
} as const;

// Payment status display names
export const PAYMENT_STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'yellow' },
  PAID: { label: 'Paid', color: 'green' },
  FAILED: { label: 'Failed', color: 'red' },
  REFUNDED: { label: 'Refunded', color: 'gray' },
  PARTIALLY_REFUNDED: { label: 'Partially Refunded', color: 'orange' },
} as const;

// Product status display names
export const PRODUCT_STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'gray' },
  ACTIVE: { label: 'Active', color: 'green' },
  INACTIVE: { label: 'Inactive', color: 'yellow' },
  OUT_OF_STOCK: { label: 'Out of Stock', color: 'red' },
} as const;

// Address types
export const ADDRESS_TYPES = ['HOME', 'OFFICE', 'OTHER'] as const;

// User roles
export const USER_ROLES = ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'] as const;

// Indian states list
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
] as const;

// Payment methods
export const PAYMENT_METHODS = {
  UPI: { label: 'UPI', icon: 'upi' },
  CARD: { label: 'Credit/Debit Card', icon: 'card' },
  NETBANKING: { label: 'Net Banking', icon: 'bank' },
  WALLET: { label: 'Wallet', icon: 'wallet' },
  COD: { label: 'Cash on Delivery', icon: 'cash' },
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_PRODUCT: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// Validation constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  ADDRESS_MIN_LENGTH: 10,
  ADDRESS_MAX_LENGTH: 500,
  PHONE_REGEX: /^[6-9]\d{9}$/,
  PINCODE_REGEX: /^\d{6}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Currency
export const CURRENCY = {
  CODE: 'INR',
  SYMBOL: '₹',
  LOCALE: 'en-IN',
} as const;

// Shipping
export const SHIPPING = {
  FREE_SHIPPING_THRESHOLD: 499,
  DEFAULT_SHIPPING_FEE: 49,
} as const;
