export const CATEGORY_OPTIONS = [
  { value: 'MACHINERY', label: 'Machinery', description: 'Tractors, tillers, rotavators' },
  { value: 'TOOLS', label: 'Tools', description: 'Sprayers, hoes, hand tools' },
  { value: 'IRRIGATION', label: 'Irrigation', description: 'Pipes, pumps, drip systems' },
  { value: 'SEEDS', label: 'Seeds', description: 'Field and vegetable seeds' },
  { value: 'FERTILIZERS', label: 'Fertilizers', description: 'Compost and nutrients' },
  { value: 'PESTICIDES', label: 'Pesticides', description: 'Crop protection inputs' },
  { value: 'OTHER', label: 'Other', description: 'Everything else agricultural' },
]

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORY_OPTIONS.map((category) => [category.value, category.label]),
)

export const REGIONS = [
  'Nashik',
  'Pune',
  'Nagpur',
  'Aurangabad',
  'Kolhapur',
  'Satara',
  'Solapur',
  'Ahmednagar',
  'Jalgaon',
  'Other',
]

export const UNIT_OPTIONS = [
  { value: 'PIECE', label: 'Piece' },
  { value: 'KG', label: 'Kilogram' },
  { value: 'LITRE', label: 'Litre' },
  { value: 'BAG', label: 'Bag' },
  { value: 'QUINTAL', label: 'Quintal' },
]

export const UNIT_LABELS = Object.fromEntries(
  UNIT_OPTIONS.map((unit) => [unit.value, unit.label]),
)

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'mr', label: 'मराठी (Marathi)' },
]

export const ROLE_OPTIONS = [
  { value: 'FARMER', label: 'Farmer / seller' },
  { value: 'CUSTOMER', label: 'Customer / buyer' },
  { value: 'BOTH', label: 'Farmer and buyer' },
]

export const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Newest first' },
  { value: 'price,asc', label: 'Price: low to high' },
  { value: 'price,desc', label: 'Price: high to low' },
  { value: 'title,asc', label: 'Name A–Z' },
]

export const LISTING_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SOLD', label: 'Sold' },
]

export const DEMAND_SCORE_THRESHOLD = 30
export const DEMAND_WINDOW_DAYS = 30

export const DEMO_ACCOUNTS = [
  {
    label: 'Farmer (Nashik)',
    name: 'Ramesh Patil',
    phone: '9876543210',
    password: 'password',
    role: 'FARMER',
  },
  {
    label: 'Customer (Nashik)',
    name: 'Asha Kulkarni',
    phone: '9876543213',
    password: 'password',
    role: 'CUSTOMER',
  },
]
