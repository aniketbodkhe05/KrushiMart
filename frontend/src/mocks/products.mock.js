import { apiError, delay, readJson, requireSessionUser, writeJson } from './mockUtils'
import { findMockUser } from './users.mock'

const PRODUCTS_KEY = 'krushimart.mock.products.v1'

export const DEMO_PRODUCTS = [
  {
    id: 1,
    sellerId: 1,
    sellerName: 'Ramesh Patil',
    title: 'Mini Tiller 7HP',
    description:
      'Well-maintained 7HP mini tiller suitable for small plots and orchards. Includes standard rotavator blades. Inspection welcome.',
    category: 'MACHINERY',
    price: 45000,
    currency: 'INR',
    quantityAvailable: 1,
    unit: 'PIECE',
    listingStatus: 'ACTIVE',
    language: 'mr',
    region: 'Nashik',
    imageUrl: null,
    available: true,
    createdAt: '2026-10-15T08:30:00Z',
    updatedAt: '2026-10-15T08:30:00Z',
  },
  {
    id: 2,
    sellerId: 3,
    sellerName: 'Vijay Jadhav',
    title: 'Drip Irrigation Pipe Connector',
    description:
      '16mm drip irrigation connectors, 250 pieces available. UV-stable agricultural grade, suitable for row crops.',
    category: 'IRRIGATION',
    price: 120,
    currency: 'INR',
    quantityAvailable: 250,
    unit: 'PIECE',
    listingStatus: 'ACTIVE',
    language: 'en',
    region: 'Nagpur',
    imageUrl: null,
    available: true,
    createdAt: '2026-10-16T09:00:00Z',
    updatedAt: '2026-10-16T09:00:00Z',
  },
  {
    id: 3,
    sellerId: 2,
    sellerName: 'Sunita Deshmukh',
    title: 'Onion Seeds N-53',
    description:
      'Certified N-53 onion seed from the current season. Germination tested; stored in sealed bags. Packed in 1kg units.',
    category: 'SEEDS',
    price: 850,
    currency: 'INR',
    quantityAvailable: 40,
    unit: 'KG',
    listingStatus: 'ACTIVE',
    language: 'mr',
    region: 'Nashik',
    imageUrl: null,
    available: true,
    createdAt: '2026-10-17T06:45:00Z',
    updatedAt: '2026-10-17T06:45:00Z',
  },
  {
    id: 4,
    sellerId: 2,
    sellerName: 'Sunita Deshmukh',
    title: 'Vermicompost Organic Fertilizer',
    description:
      'Farm-produced vermicompost, sieved and bagged. Suitable for vegetables and fruit orchards. Pickup from farm.',
    category: 'FERTILIZERS',
    price: 15,
    currency: 'INR',
    quantityAvailable: 500,
    unit: 'KG',
    listingStatus: 'ACTIVE',
    language: 'en',
    region: 'Pune',
    imageUrl: null,
    available: true,
    createdAt: '2026-10-17T10:15:00Z',
    updatedAt: '2026-10-17T10:15:00Z',
  },
  {
    id: 5,
    sellerId: 1,
    sellerName: 'Ramesh Patil',
    title: 'Knapsack Battery Sprayer',
    description:
      '16 litre battery-operated knapsack sprayer with two nozzles and charger. Ideal for grape and vegetable plots.',
    category: 'TOOLS',
    price: 3200,
    currency: 'INR',
    quantityAvailable: 5,
    unit: 'PIECE',
    listingStatus: 'ACTIVE',
    language: 'en',
    region: 'Nashik',
    imageUrl: null,
    available: true,
    createdAt: '2026-10-18T07:20:00Z',
    updatedAt: '2026-10-18T07:20:00Z',
  },
  {
    id: 6,
    sellerId: 3,
    sellerName: 'Vijay Jadhav',
    title: 'Borewell Submersible Pump 1HP',
    description:
      'Single-phase 1HP submersible pump. Sold and removed from service in working condition.',
    category: 'IRRIGATION',
    price: 12500,
    currency: 'INR',
    quantityAvailable: 0,
    unit: 'PIECE',
    listingStatus: 'SOLD',
    language: 'en',
    region: 'Nagpur',
    imageUrl: null,
    available: false,
    createdAt: '2026-10-10T08:00:00Z',
    updatedAt: '2026-10-19T12:00:00Z',
  },
  {
    id: 7,
    sellerId: 2,
    sellerName: 'Sunita Deshmukh',
    title: 'Neem Oil Pesticide',
    description:
      'Cold-pressed neem oil for pest management. 25 litres available in sealed cans. Usage guidance provided.',
    category: 'PESTICIDES',
    price: 450,
    currency: 'INR',
    quantityAvailable: 25,
    unit: 'LITRE',
    listingStatus: 'ACTIVE',
    language: 'hi',
    region: 'Pune',
    imageUrl: null,
    available: true,
    createdAt: '2026-10-18T11:30:00Z',
    updatedAt: '2026-10-18T11:30:00Z',
  },
  {
    id: 8,
    sellerId: 1,
    sellerName: 'Ramesh Patil',
    title: 'Rotavator 5 Feet',
    description:
      'Five-foot rotavator previously used with a 45HP tractor. Listing paused while maintenance is completed.',
    category: 'MACHINERY',
    price: 38000,
    currency: 'INR',
    quantityAvailable: 1,
    unit: 'PIECE',
    listingStatus: 'INACTIVE',
    language: 'en',
    region: 'Nashik',
    imageUrl: null,
    available: false,
    createdAt: '2026-10-12T09:00:00Z',
    updatedAt: '2026-10-20T09:00:00Z',
  },
]

export function readMockProducts() {
  return readJson(PRODUCTS_KEY, DEMO_PRODUCTS)
}

export function saveMockProducts(products) {
  writeJson(PRODUCTS_KEY, products)
}

function isAvailable(product) {
  return product.listingStatus === 'ACTIVE' && Number(product.quantityAvailable) > 0
}

export function filterMockProducts(params = {}) {
  const q = (params.q || '').trim().toLowerCase()
  const category = params.category || ''
  const region = params.region || ''
  const availability =
    params.available === undefined || params.available === ''
      ? true
      : params.available === true || params.available === 'true'

  return readMockProducts()
    .map((product) => ({ ...product, available: isAvailable(product) }))
    .filter((product) => {
      if (availability && !product.available) return false
      if (params.available === false || params.available === 'false') {
        if (product.available) return false
      }
      if (category && product.category !== category) return false
      if (region && product.region.toLowerCase() !== region.toLowerCase()) return false
      if (q) {
        const haystack =
          `${product.title} ${product.description} ${product.region} ${product.category}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
}

export function sortMockItems(items, sort) {
  const [field = 'createdAt', direction = 'desc'] = (sort || 'createdAt,desc').split(',')
  const factor = direction === 'asc' ? 1 : -1
  return [...items].sort((left, right) => {
    const a = left[field]
    const b = right[field]
    if (field === 'price') return (Number(a) - Number(b)) * factor
    return String(a).localeCompare(String(b)) * factor
  })
}

export async function mockListProducts(params = {}) {
  await delay(180)
  const page = Math.max(Number(params.page) || 0, 0)
  const size = Math.min(Math.max(Number(params.size) || 12, 1), 50)
  const filtered = sortMockItems(filterMockProducts(params), params.sort)
  const items = filtered.slice(page * size, page * size + size)
  return {
    items,
    page,
    size,
    total: filtered.length,
    totalPages: filtered.length === 0 ? 0 : Math.ceil(filtered.length / size),
  }
}

export async function mockGetProduct(id) {
  await delay(160)
  const product = readMockProducts().find((item) => item.id === Number(id))
  if (!product) throw apiError('Product not found', 'NOT_FOUND')
  return { ...product, available: isAvailable(product) }
}

export async function mockCreateProduct(payload) {
  await delay()
  const user = requireSessionUser()
  if (!['FARMER', 'BOTH'].includes(user.role)) {
    throw apiError('Only farmer accounts can create listings', 'FORBIDDEN')
  }
  const products = readMockProducts()
  const id = Math.max(...products.map((product) => product.id), 0) + 1
  const now = new Date().toISOString()
  const product = {
    ...payload,
    id,
    sellerId: user.id,
    sellerName: user.fullName,
    currency: 'INR',
    listingStatus: payload.listingStatus || 'ACTIVE',
    language: payload.language || 'en',
    imageUrl: payload.imageUrl || null,
    createdAt: now,
    updatedAt: now,
  }
  product.available = isAvailable(product)
  saveMockProducts([...products, product])
  return product
}

export async function mockUpdateProduct(id, payload) {
  await delay()
  const user = requireSessionUser()
  const products = readMockProducts()
  const index = products.findIndex((product) => product.id === Number(id))
  if (index < 0) throw apiError('Product not found', 'NOT_FOUND')
  if (products[index].sellerId !== user.id) {
    throw apiError('Only the listing owner can modify this product', 'FORBIDDEN')
  }
  const updated = {
    ...products[index],
    ...payload,
    currency: 'INR',
    imageUrl: payload.imageUrl || null,
    updatedAt: new Date().toISOString(),
  }
  updated.available = isAvailable(updated)
  products[index] = updated
  saveMockProducts(products)
  return updated
}

export async function mockDeactivateProduct(id) {
  await delay()
  const user = requireSessionUser()
  const products = readMockProducts()
  const index = products.findIndex((product) => product.id === Number(id))
  if (index < 0) throw apiError('Product not found', 'NOT_FOUND')
  if (products[index].sellerId !== user.id) {
    throw apiError('Only the listing owner can modify this product', 'FORBIDDEN')
  }
  products[index] = {
    ...products[index],
    listingStatus: 'INACTIVE',
    available: false,
    updatedAt: new Date().toISOString(),
  }
  saveMockProducts(products)
}

export async function mockGetContactCard(productId) {
  await delay(160)
  const product = readMockProducts().find((item) => item.id === Number(productId))
  if (!product) throw apiError('Product not found', 'NOT_FOUND')
  const seller = findMockUser(product.sellerId)
  const visible = isAvailable(product) && seller?.contactVisible
  return {
    productId: product.id,
    sellerId: product.sellerId,
    sellerName: seller?.fullName || product.sellerName,
    phone: visible ? seller?.phone : null,
    region: seller?.region || product.region,
    contactVisible: Boolean(visible),
    consentNote: visible
      ? 'The seller has opted in to share this phone number for inquiries about this listing. Use it only for this product and do not redistribute it.'
      : 'The seller has not made contact details visible for this listing, or the listing is no longer available.',
  }
}
