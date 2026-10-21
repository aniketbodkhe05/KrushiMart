import { readJson, writeJson, delay, apiError } from './mockUtils'

const USERS_KEY = 'krushimart.mock.users.v1'

export const DEMO_USERS = [
  {
    id: 1,
    fullName: 'Ramesh Patil',
    phone: '9876543210',
    password: 'password',
    role: 'FARMER',
    region: 'Nashik',
    preferredCategories: ['MACHINERY', 'TOOLS', 'IRRIGATION'],
    notifyOptIn: true,
    contactVisible: true,
    createdAt: '2026-09-11T05:00:00Z',
  },
  {
    id: 2,
    fullName: 'Sunita Deshmukh',
    phone: '9876543211',
    password: 'password',
    role: 'FARMER',
    region: 'Pune',
    preferredCategories: ['SEEDS', 'FERTILIZERS', 'PESTICIDES'],
    notifyOptIn: true,
    contactVisible: true,
    createdAt: '2026-09-13T05:00:00Z',
  },
  {
    id: 3,
    fullName: 'Vijay Jadhav',
    phone: '9876543212',
    password: 'password',
    role: 'FARMER',
    region: 'Nagpur',
    preferredCategories: ['IRRIGATION', 'TOOLS'],
    notifyOptIn: true,
    contactVisible: true,
    createdAt: '2026-09-16T05:00:00Z',
  },
  {
    id: 4,
    fullName: 'Asha Kulkarni',
    phone: '9876543213',
    password: 'password',
    role: 'CUSTOMER',
    region: 'Nashik',
    preferredCategories: [],
    notifyOptIn: true,
    contactVisible: false,
    createdAt: '2026-10-01T05:00:00Z',
  },
  {
    id: 5,
    fullName: 'Ganesh Pawar',
    phone: '9876543214',
    password: 'password',
    role: 'CUSTOMER',
    region: 'Nashik',
    preferredCategories: [],
    notifyOptIn: true,
    contactVisible: false,
    createdAt: '2026-10-03T05:00:00Z',
  },
  {
    id: 6,
    fullName: 'Meera Shinde',
    phone: '9876543215',
    password: 'password',
    role: 'CUSTOMER',
    region: 'Nashik',
    preferredCategories: [],
    notifyOptIn: true,
    contactVisible: false,
    createdAt: '2026-10-06T05:00:00Z',
  },
]

export function readUsers() {
  return readJson(USERS_KEY, DEMO_USERS)
}

export function saveUsers(users) {
  writeJson(USERS_KEY, users)
}

export function toPublicUser(user) {
  if (!user) return null
  const { password: _password, ...publicUser } = user
  return {
    ...publicUser,
    preferredCategories: publicUser.preferredCategories || [],
  }
}

export async function mockLogin({ phone, password }) {
  await delay()
  const user = readUsers().find((candidate) => candidate.phone === phone.trim())
  if (!user || user.password !== password) {
    throw apiError('Phone number or password is incorrect', 'INVALID_CREDENTIALS')
  }
  return {
    token: `demo-token-${user.id}`,
    tokenType: 'Bearer',
    expiresInMs: 86400000,
    user: toPublicUser(user),
  }
}

export async function mockRegister(payload) {
  await delay()
  const users = readUsers()
  if (users.some((user) => user.phone === payload.phone)) {
    throw apiError('An account with this phone number already exists', 'CONFLICT')
  }
  const user = {
    id: Math.max(...users.map((candidate) => candidate.id), 0) + 1,
    fullName: payload.fullName.trim(),
    phone: payload.phone.trim(),
    password: payload.password,
    role: payload.role,
    region: payload.region,
    preferredCategories: payload.preferredCategories || [],
    notifyOptIn: payload.notifyOptIn ?? true,
    contactVisible: true,
    createdAt: new Date().toISOString(),
  }
  saveUsers([...users, user])
  return {
    token: `demo-token-${user.id}`,
    tokenType: 'Bearer',
    expiresInMs: 86400000,
    user: toPublicUser(user),
  }
}

export async function mockUpdateProfile(userId, values) {
  await delay()
  const users = readUsers()
  const index = users.findIndex((user) => user.id === userId)
  if (index < 0) throw apiError('Profile not found', 'NOT_FOUND')
  const updated = {
    ...users[index],
    fullName: values.fullName,
    region: values.region,
    preferredCategories: values.preferredCategories || [],
    notifyOptIn: values.notifyOptIn,
    contactVisible: values.contactVisible,
  }
  users[index] = updated
  saveUsers(users)
  return toPublicUser(updated)
}

export function findMockUser(id) {
  return readUsers().find((user) => user.id === Number(id)) || null
}
