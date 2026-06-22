import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  dbHouseToHouse,
  buildHouseInsert,
  ensureUniqueSlug,
  type CreateHouseInput,
  type DbHouse,
} from '@/lib/houses-service'
import { generateSlug } from '@/lib/houses'

const createHouseSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  houseNumber: z.string().min(1, 'House number is required'),
  city: z.string().min(1).default('Rīga'),
  district: z.string().min(1).default('Pļavnieki'),
  postalCode: z.string().optional(),
  apartmentCount: z.number().int().min(1).max(2000),
  yearBuilt: z.number().int().min(1800).max(2100).optional(),
  floors: z.number().int().min(1).max(50).optional(),
  buildingType: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('houses')
      .select('*')
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const houses = ((data ?? []) as DbHouse[]).map(dbHouseToHouse)
    return NextResponse.json({ houses })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load houses'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = createHouseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const input: CreateHouseInput = parsed.data
    const supabase = await createClient()

    const baseSlug = generateSlug(input.street, input.houseNumber)
    const slug = await ensureUniqueSlug(baseSlug, async (candidate) => {
      const { data } = await supabase
        .from('houses')
        .select('id')
        .eq('slug', candidate)
        .maybeSingle()
      return !!data
    })

    const insertData = buildHouseInsert(input, slug)

    const { data, error } = await supabase
      .from('houses')
      .insert(insertData)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const house = dbHouseToHouse(data as DbHouse)
    return NextResponse.json({ house }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create house'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}