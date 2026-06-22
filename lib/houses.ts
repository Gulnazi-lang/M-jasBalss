export type House = {
  id: string
  slug: string
  address: string
  street: string
  houseNumber: string
  city: string
  district: string
  lat: number
  lng: number
  apartmentCount: number
  entranceCount?: number
  yearBuilt?: number
  floors?: number
  buildingType?: string
  featured?: boolean
  fromDb?: boolean
}

export function generateSlug(street: string, houseNumber: string): string {
  const raw = fold(`${street}-${houseNumber}`)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return raw || `house-${Date.now()}`
}

/** Pļavnieki — default map center (Zemes iela, Pļavnieki) */
export const PLAVNIEKI_CENTER = {
  lat: 56.94216,
  lng: 24.19667,
  zoom: 17,
} as const

export const DEMO_HOUSES: House[] = [
  {
    id: 'house-zemes-1',
    slug: 'zemes-iela-1',
    address: 'Rīga, Zemes iela 1',
    street: 'Zemes iela',
    houseNumber: '1',
    city: 'Rīga',
    district: 'Pļavnieki',
    lat: 56.9420456,
    lng: 24.1961964,
    apartmentCount: 35,
    yearBuilt: 1985,
    floors: 9,
    buildingType: 'panel',
    featured: true,
  },
  {
    id: 'house-zemes-3',
    slug: 'zemes-iela-3',
    address: 'Rīga, Zemes iela 3',
    street: 'Zemes iela',
    houseNumber: '3',
    city: 'Rīga',
    district: 'Pļavnieki',
    lat: 56.9422744,
    lng: 24.1971483,
    apartmentCount: 108,
    entranceCount: 3,
    yearBuilt: 1987,
    floors: 9,
    buildingType: 'panel',
    featured: true,
  },
  {
    id: 'house-123',
    slug: 'andreja-saharova-20',
    address: 'Rīga, Andreja Saharova iela 20',
    street: 'Andreja Saharova iela',
    houseNumber: '20',
    city: 'Rīga',
    district: 'Pļavnieki',
    lat: 56.96886,
    lng: 24.19847,
    apartmentCount: 48,
  },
  {
    id: 'house-124',
    slug: 'andreja-saharova-22',
    address: 'Rīga, Andreja Saharova iela 22',
    street: 'Andreja Saharova iela',
    houseNumber: '22',
    city: 'Rīga',
    district: 'Pļavnieki',
    lat: 56.96905,
    lng: 24.19892,
    apartmentCount: 52,
  },
  {
    id: 'house-125',
    slug: 'andreja-saharova-24',
    address: 'Rīga, Andreja Saharova iela 24',
    street: 'Andreja Saharova iela',
    houseNumber: '24',
    city: 'Rīga',
    district: 'Pļavnieki',
    lat: 56.96924,
    lng: 24.19938,
    apartmentCount: 60,
  },
  {
    id: 'house-126',
    slug: 'dzelzavas-72',
    address: 'Rīga, Dzelzavas iela 72',
    street: 'Dzelzavas iela',
    houseNumber: '72',
    city: 'Rīga',
    district: 'Pļavnieki',
    lat: 56.97108,
    lng: 24.20542,
    apartmentCount: 80,
  },
  {
    id: 'house-127',
    slug: 'dzelzavas-74',
    address: 'Rīga, Dzelzavas iela 74',
    street: 'Dzelzavas iela',
    houseNumber: '74',
    city: 'Rīga',
    district: 'Pļavnieki',
    lat: 56.97127,
    lng: 24.20588,
    apartmentCount: 72,
  },
  {
    id: 'house-128',
    slug: 'lubanas-56',
    address: 'Rīga, Lubānas iela 56',
    street: 'Lubānas iela',
    houseNumber: '56',
    city: 'Rīga',
    district: 'Pļavnieki',
    lat: 56.96438,
    lng: 24.20875,
    apartmentCount: 96,
  },
  {
    id: 'house-129',
    slug: 'lubanas-58',
    address: 'Rīga, Lubānas iela 58',
    street: 'Lubānas iela',
    houseNumber: '58',
    city: 'Rīga',
    district: 'Pļavnieki',
    lat: 56.96456,
    lng: 24.20921,
    apartmentCount: 88,
  },
  {
    id: 'house-130',
    slug: 'maskavas-258',
    address: 'Rīga, Maskavas iela 258',
    street: 'Maskavas iela',
    houseNumber: '258',
    city: 'Rīga',
    district: 'Pļavnieki',
    lat: 56.96195,
    lng: 24.20085,
    apartmentCount: 120,
  },
  {
    id: 'house-131',
    slug: 'ilukstes-67',
    address: 'Rīga, Ilūkstes iela 67',
    street: 'Ilūkstes iela',
    houseNumber: '67',
    city: 'Rīga',
    district: 'Pļavnieki',
    lat: 56.96612,
    lng: 24.21105,
    apartmentCount: 64,
  },
  {
    id: 'house-132',
    slug: 'kugu-26',
    address: 'Rīga, Kuģu iela 26',
    street: 'Kuģu iela',
    houseNumber: '26',
    city: 'Rīga',
    district: 'Pļavnieki',
    lat: 56.97015,
    lng: 24.2021,
    apartmentCount: 40,
  },
]

export type HouseSearchResult = House & { score: number }

function fold(text: string): string {
  return text
    .toLowerCase()
    .replace(/ā/g, 'a')
    .replace(/č/g, 'c')
    .replace(/ē/g, 'e')
    .replace(/ģ/g, 'g')
    .replace(/ī/g, 'i')
    .replace(/ķ/g, 'k')
    .replace(/ļ/g, 'l')
    .replace(/ņ/g, 'n')
    .replace(/š/g, 's')
    .replace(/ū/g, 'u')
    .replace(/ž/g, 'z')
}

function scoreHouse(house: House, tokens: string[]): number {
  const fields = {
    slug: fold(house.slug),
    street: fold(house.street),
    number: fold(house.houseNumber),
    address: fold(house.address),
    district: fold(house.district),
  }

  const combined = Object.values(fields).join(' ')
  let score = 0

  for (const token of tokens) {
    if (fields.slug === token) score += 120
    else if (fields.slug.startsWith(token)) score += 90
    else if (fields.number === token) score += 80
    else if (fields.street.startsWith(token)) score += 70
    else if (`${fields.street} ${fields.number}`.includes(token)) score += 55
    else if (combined.includes(token)) score += 30
    else return 0
  }

  if (house.featured) score += 5
  return score
}

export function getDemoHouseBySlug(slug: string): House | undefined {
  return DEMO_HOUSES.find((h) => h.slug === slug || h.id === slug)
}

export function getHouseBySlug(slug: string, houses: House[] = DEMO_HOUSES): House | undefined {
  return houses.find((h) => h.slug === slug || h.id === slug)
}

/** @deprecated Use getHouseBySlug */
export function getHouseById(id: string): House | undefined {
  return getHouseBySlug(id)
}

export function getAllHouses(houses: House[] = DEMO_HOUSES): House[] {
  return houses
}

export function getFeaturedHouses(houses: House[] = DEMO_HOUSES): House[] {
  const featured = houses.filter((h) => h.featured)
  return featured.length > 0 ? featured : houses.slice(0, 4)
}

export function searchHouses(query: string, houses: House[] = DEMO_HOUSES, limit = 50): House[] {
  return searchHousesWithScore(query, houses, limit).map(({ score: _, ...house }) => house)
}

export function searchHousesWithScore(
  query: string,
  houses: House[] = DEMO_HOUSES,
  limit = 8
): HouseSearchResult[] {
  const q = query.trim()
  if (!q) return getFeaturedHouses(houses).map((h) => ({ ...h, score: 100 }))

  const tokens = fold(q).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return getFeaturedHouses(houses).map((h) => ({ ...h, score: 100 }))

  return houses
    .map((house) => ({ ...house, score: scoreHouse(house, tokens) }))
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function highlightMatch(text: string, query: string): { text: string; match: boolean }[] {
  const foldedText = fold(text)
  const foldedQuery = fold(query.trim())
  if (!foldedQuery) return [{ text, match: false }]

  const idx = foldedText.indexOf(foldedQuery)
  if (idx === -1) return [{ text, match: false }]

  return [
    { text: text.slice(0, idx), match: false },
    { text: text.slice(idx, idx + query.trim().length), match: true },
    { text: text.slice(idx + query.trim().length), match: false },
  ].filter((p) => p.text.length > 0)
}