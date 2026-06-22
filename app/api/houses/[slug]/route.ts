import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dbHouseToHouse, type DbHouse } from '@/lib/houses-service'
import { getDemoHouseBySlug } from '@/lib/houses'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const demo = getDemoHouseBySlug(slug)
  if (demo) {
    return NextResponse.json({ house: demo })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('houses')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'House not found' }, { status: 404 })
    }

    return NextResponse.json({ house: dbHouseToHouse(data as DbHouse) })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load house'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}