import type { Tables, Inserts } from '@/types/database'
import type { House } from '@/lib/houses'
import { generateSlug, DEMO_HOUSES } from '@/lib/houses'

export type DbHouse = Tables<'houses'>

export type CreateHouseInput = {
  street: string
  houseNumber: string
  city: string
  district: string
  postalCode?: string
  apartmentCount: number
  yearBuilt?: number
  floors?: number
  buildingType?: string
  lat: number
  lng: number
}

export function dbHouseToHouse(row: DbHouse): House {
  const street = row.street ?? ''
  const houseNumber = row.house_number ?? ''
  const city = row.city ?? 'Rīga'

  return {
    id: row.id,
    slug: row.slug ?? generateSlug(street, houseNumber),
    address: row.address,
    street,
    houseNumber,
    city,
    district: row.district ?? 'Pļavnieki',
    lat: row.lat ?? 0,
    lng: row.lng ?? 0,
    apartmentCount: row.apartment_count ?? 0,
    yearBuilt: row.year_built ?? undefined,
    floors: row.floors ?? undefined,
    buildingType: row.building_type ?? undefined,
    fromDb: true,
  }
}

export function buildHouseInsert(
  input: CreateHouseInput,
  slug: string
): Inserts<'houses'> {
  const address = `${input.city}, ${input.street} ${input.houseNumber}`.trim()

  return {
    address,
    city: input.city,
    street: input.street,
    house_number: input.houseNumber,
    postal_code: input.postalCode || null,
    apartment_count: input.apartmentCount,
    slug,
    lat: input.lat,
    lng: input.lng,
    district: input.district,
    year_built: input.yearBuilt ?? null,
    floors: input.floors ?? null,
    building_type: input.buildingType ?? null,
  }
}

const DEMO_BY_SLUG = new Map(DEMO_HOUSES.map((h) => [h.slug, h]))

/** Overlay demo map metadata (coords, featured) onto DB rows with the same slug. */
function enrichDbHouse(dbHouse: House): House {
  const demo = DEMO_BY_SLUG.get(dbHouse.slug)
  if (!demo) return dbHouse

  return {
    ...dbHouse,
    lat: demo.lat,
    lng: demo.lng,
    featured: demo.featured,
    apartmentCount: demo.apartmentCount,
    entranceCount: demo.entranceCount,
    yearBuilt: demo.yearBuilt ?? dbHouse.yearBuilt,
    floors: demo.floors ?? dbHouse.floors,
    buildingType: demo.buildingType ?? dbHouse.buildingType,
  }
}

export function mergeHouses(dbHouses: House[]): House[] {
  const dbSlugs = new Set(dbHouses.map((h) => h.slug))
  const enrichedDb = dbHouses.map(enrichDbHouse)
  const demoOnly = DEMO_HOUSES.filter((h) => !dbSlugs.has(h.slug))
  return [...enrichedDb, ...demoOnly]
}

export async function ensureUniqueSlug(
  baseSlug: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  if (!(await exists(baseSlug))) return baseSlug

  for (let i = 2; i < 100; i++) {
    const candidate = `${baseSlug}-${i}`
    if (!(await exists(candidate))) return candidate
  }

  return `${baseSlug}-${Date.now()}`
}