export type ReverseGeocodeResult = {
  street: string
  houseNumber: string
  city: string
  district: string
  postalCode: string
  fullAddress: string
}

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse')
    url.searchParams.set('lat', String(lat))
    url.searchParams.set('lon', String(lng))
    url.searchParams.set('format', 'json')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('accept-language', 'lv,ru,en')

    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'MajasBalss.lv/1.0' },
    })

    if (!res.ok) return null

    const data = await res.json()
    const addr = data.address ?? {}

    const street = addr.road || addr.pedestrian || addr.footway || ''
    const houseNumber = addr.house_number || ''
    const city = addr.city || addr.town || addr.village || 'Rīga'
    const district = addr.suburb || addr.neighbourhood || addr.quarter || 'Pļavnieki'
    const postalCode = addr.postcode || ''

    const fullAddress = [city, street, houseNumber].filter(Boolean).join(', ')

    return {
      street,
      houseNumber,
      city,
      district,
      postalCode,
      fullAddress: fullAddress || data.display_name || '',
    }
  } catch {
    return null
  }
}