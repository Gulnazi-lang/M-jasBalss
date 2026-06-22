'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { MapPin, Loader2, Building2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { reverseGeocode } from '@/lib/geocoding'
import type { House } from '@/lib/houses'

export type PlacementPin = {
  lat: number
  lng: number
}

type FormState = {
  street: string
  houseNumber: string
  city: string
  district: string
  postalCode: string
  apartmentCount: string
  yearBuilt: string
  floors: string
  buildingType: string
}

type CreateHouseModalProps = {
  isOpen: boolean
  onClose: () => void
  pin: PlacementPin | null
  onCreated: (house: House) => void
}

const EMPTY_FORM: FormState = {
  street: '',
  houseNumber: '',
  city: 'Rīga',
  district: 'Pļavnieki',
  postalCode: '',
  apartmentCount: '',
  yearBuilt: '',
  floors: '',
  buildingType: 'panel',
}

export function CreateHouseModal({ isOpen, onClose, pin, onCreated }: CreateHouseModalProps) {
  const t = useTranslations('createHouse')
  const tCommon = useTranslations('common')

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen || !pin) return

    setForm(EMPTY_FORM)
    setError('')
    setGeocoding(true)

    reverseGeocode(pin.lat, pin.lng).then((result) => {
      setGeocoding(false)
      if (!result) return

      setForm((prev) => ({
        ...prev,
        street: result.street || prev.street,
        houseNumber: result.houseNumber || prev.houseNumber,
        city: result.city || prev.city,
        district: result.district || prev.district,
        postalCode: result.postalCode || prev.postalCode,
      }))
    })
  }, [isOpen, pin?.lat, pin?.lng])

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pin) {
      setError(t('pinRequired'))
      return
    }

    const apartmentCount = parseInt(form.apartmentCount, 10)
    if (!form.street.trim() || !form.houseNumber.trim() || !apartmentCount || apartmentCount < 1) {
      setError(t('requiredFields'))
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/houses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          street: form.street.trim(),
          houseNumber: form.houseNumber.trim(),
          city: form.city.trim() || 'Rīga',
          district: form.district.trim() || 'Pļavnieki',
          postalCode: form.postalCode.trim() || undefined,
          apartmentCount,
          yearBuilt: form.yearBuilt ? parseInt(form.yearBuilt, 10) : undefined,
          floors: form.floors ? parseInt(form.floors, 10) : undefined,
          buildingType: form.buildingType || undefined,
          lat: pin.lat,
          lng: pin.lng,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? t('createFailed'))
        return
      }

      onCreated(data.house)
    } catch {
      setError(t('createFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')} className="md:max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {pin && (
          <div className="create-house-pin-badge">
            <MapPin className="h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-medium text-muted">{t('location')}</div>
              <div className="text-sm font-mono truncate">
                {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
              </div>
            </div>
            {geocoding && (
              <span className="text-xs text-muted flex items-center gap-1 ml-auto">
                <Loader2 className="h-3 w-3 animate-spin" />
                {t('detectingAddress')}
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="create-house-label">{t('street')}</label>
            <input
              className="input"
              value={form.street}
              onChange={(e) => update('street', e.target.value)}
              placeholder="Zemes iela"
              required
            />
          </div>
          <div>
            <label className="create-house-label">{t('houseNumber')}</label>
            <input
              className="input"
              value={form.houseNumber}
              onChange={(e) => update('houseNumber', e.target.value)}
              placeholder="1"
              required
            />
          </div>
          <div>
            <label className="create-house-label">{t('apartmentCount')}</label>
            <input
              className="input"
              type="number"
              min={1}
              value={form.apartmentCount}
              onChange={(e) => update('apartmentCount', e.target.value)}
              placeholder="36"
              required
            />
          </div>
          <div>
            <label className="create-house-label">{t('city')}</label>
            <input
              className="input"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
            />
          </div>
          <div>
            <label className="create-house-label">{t('district')}</label>
            <input
              className="input"
              value={form.district}
              onChange={(e) => update('district', e.target.value)}
            />
          </div>
          <div>
            <label className="create-house-label">{t('yearBuilt')}</label>
            <input
              className="input"
              type="number"
              min={1800}
              max={2100}
              value={form.yearBuilt}
              onChange={(e) => update('yearBuilt', e.target.value)}
              placeholder="1985"
            />
          </div>
          <div>
            <label className="create-house-label">{t('floors')}</label>
            <input
              className="input"
              type="number"
              min={1}
              max={50}
              value={form.floors}
              onChange={(e) => update('floors', e.target.value)}
              placeholder="9"
            />
          </div>
          <div>
            <label className="create-house-label">{t('postalCode')}</label>
            <input
              className="input"
              value={form.postalCode}
              onChange={(e) => update('postalCode', e.target.value)}
              placeholder="LV-1082"
            />
          </div>
          <div>
            <label className="create-house-label">{t('buildingType')}</label>
            <select
              className="input"
              value={form.buildingType}
              onChange={(e) => update('buildingType', e.target.value)}
            >
              <option value="panel">{t('types.panel')}</option>
              <option value="brick">{t('types.brick')}</option>
              <option value="wooden">{t('types.wooden')}</option>
              <option value="mixed">{t('types.mixed')}</option>
              <option value="other">{t('types.other')}</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <Button type="submit" className="flex-1" disabled={loading || !pin}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {tCommon('loading')}
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4" />
                {t('submit')}
              </>
            )}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            {tCommon('cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}