import { getStoredUser } from '../lib/storage'
import { DEMAND_SCORE_THRESHOLD, DEMAND_WINDOW_DAYS } from '../lib/constants'
import { readMockProducts } from './products.mock'
import { readMockRequests } from './requests.mock'
import { readMockSearchEvents } from './search.mock'
import { apiError, delay } from './mockUtils'

function eligible(user, category, region) {
  if (!user || !['FARMER', 'BOTH'].includes(user.role)) return false
  if (user.region?.toLowerCase() === region.toLowerCase()) return true
  return (user.preferredCategories || []).includes(category)
}

function computeOpportunities() {
  const now = Date.now()
  const since = now - DEMAND_WINDOW_DAYS * 24 * 60 * 60 * 1000
  const buckets = new Map()

  const bucketFor = (category, region) => {
    const key = `${category}|${region.toLowerCase()}`
    if (!buckets.has(key)) {
      buckets.set(key, {
        category,
        region,
        requests: [],
        requesters: new Set(),
        searchKeys: new Set(),
        lastDemandAt: null,
      })
    }
    return buckets.get(key)
  }

  for (const request of readMockRequests()) {
    if (request.status !== 'OPEN' || new Date(request.createdAt).getTime() < since) continue
    const bucket = bucketFor(request.category, request.region)
    bucket.requests.push(request)
    bucket.requesters.add(request.requesterId)
    bucket.lastDemandAt = Math.max(bucket.lastDemandAt || 0, new Date(request.createdAt).getTime())
  }

  for (const event of readMockSearchEvents()) {
    if (event.matched || !event.category || !event.region) continue
    if (new Date(event.createdAt).getTime() < since) continue
    const bucket = bucketFor(event.category, event.region)
    const key = event.userId
      ? `u${event.userId}|${event.query.trim().toLowerCase()}`
      : `a|${event.query.trim().toLowerCase()}|${event.createdAt.slice(0, 10)}`
    bucket.searchKeys.add(key)
    bucket.lastDemandAt = Math.max(bucket.lastDemandAt || 0, new Date(event.createdAt).getTime())
  }

  const products = readMockProducts()
  const opportunities = []
  for (const bucket of buckets.values()) {
    const activeListings = products.filter(
      (product) =>
        product.category === bucket.category &&
        product.region.toLowerCase() === bucket.region.toLowerCase() &&
        product.listingStatus === 'ACTIVE' &&
        Number(product.quantityAvailable) > 0,
    ).length

    const explicitRequests = Math.min(bucket.requests.length, 10)
    const distinctRequesters = Math.min(bucket.requesters.size, 10)
    const unmatchedSearches = Math.min(bucket.searchKeys.size, 10)
    const ageDays = bucket.lastDemandAt
      ? (now - bucket.lastDemandAt) / (24 * 60 * 60 * 1000)
      : 999
    const recencyBonus = ageDays <= 7 ? 5 : ageDays <= DEMAND_WINDOW_DAYS ? 2 : 0
    const requestPoints = explicitRequests * 8
    const requesterPoints = distinctRequesters * 12
    const searchPoints = unmatchedSearches * 2
    const supplyPenalty = Math.min(activeListings * 10, 40)
    const score = Math.max(
      0,
      Math.min(
        100,
        requestPoints + requesterPoints + searchPoints + recencyBonus - supplyPenalty,
      ),
    )

    if (score < DEMAND_SCORE_THRESHOLD || bucket.requests.length === 0) continue

    const representative = [...bucket.requests].sort(
      (left, right) => left.title.length - right.title.length,
    )[0]
    const title =
      bucket.requests.length > 1
        ? `${representative.title} (+${bucket.requests.length - 1} similar)`
        : representative.title

    const reason =
      `${explicitRequests} explicit request${explicitRequests === 1 ? '' : 's'} from ` +
      `${distinctRequesters} distinct requester${distinctRequesters === 1 ? '' : 's'} ` +
      `(+${requestPoints + requesterPoints}), ${unmatchedSearches} recent unmatched search` +
      `${unmatchedSearches === 1 ? '' : 'es'} (+${searchPoints}), recency bonus (+${recencyBonus}), ` +
      `minus ${supplyPenalty} for ${activeListings} active listing` +
      `${activeListings === 1 ? '' : 's'} = ${score}/100. Opportunity threshold is ${DEMAND_SCORE_THRESHOLD}.`

    opportunities.push({
      id: 0,
      title,
      category: bucket.category,
      region: bucket.region,
      score,
      threshold: DEMAND_SCORE_THRESHOLD,
      requestCount: bucket.requests.length,
      distinctRequesters: bucket.requesters.size,
      unmatchedSearches: bucket.searchKeys.size,
      activeListings,
      reason,
      status: 'OPEN',
      lastDemandAt: new Date(bucket.lastDemandAt).toISOString(),
      createdAt: new Date(bucket.lastDemandAt).toISOString(),
    })
  }

  return opportunities
    .sort((left, right) => right.score - left.score)
    .map((opportunity, index) => ({ ...opportunity, id: index + 1 }))
}

export async function mockListOpportunities({ minScore, category } = {}) {
  await delay(220)
  const user = getStoredUser()
  if (!user || !['FARMER', 'BOTH'].includes(user.role)) {
    throw apiError('DemandGap opportunities are available to farmer accounts', 'FORBIDDEN')
  }
  const floor = minScore ?? DEMAND_SCORE_THRESHOLD
  return computeOpportunities()
    .filter((opportunity) => opportunity.score >= floor)
    .filter((opportunity) => !category || opportunity.category === category)
    .filter((opportunity) => eligible(user, opportunity.category, opportunity.region))
}

export async function mockGetOpportunity(id) {
  await delay(180)
  const user = getStoredUser()
  const opportunity = computeOpportunities().find((item) => item.id === Number(id))
  if (!opportunity) throw apiError('Demand opportunity not found', 'NOT_FOUND')
  if (!eligible(user, opportunity.category, opportunity.region)) {
    throw apiError('This opportunity is not available to you', 'FORBIDDEN')
  }
  return opportunity
}
