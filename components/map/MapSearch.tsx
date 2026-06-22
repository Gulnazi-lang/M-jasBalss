'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { MapPin, Building2, Navigation } from 'lucide-react'
import { toast } from 'sonner'
import { searchHouses, DEMO_HOUSES, PLAVNIEKI_CENTER, type House } from '@/lib/houses'
import { mergeHouses } from '@/lib/houses-service'
import { AddressAutocomplete } from './AddressAutocomplete'
import { CreateHouseModal, type PlacementPin } from './CreateHouseModal'
import { cn } from '@/lib/utils'

const HouseMap = dynamic(() => import('./HouseMap'), {
  ssr: false,
  loading: () => (
    <div className="house-map-skeleton flex items-center justify-center">
      <div className="text-sm text-muted animate-pulse">…</div>
    </div>
  ),
})

export function MapSearch() {
  const t = useTranslations('map')
  const tCreate = useTranslations('createHouse')
  const locale = useLocale()
  const router = useRouter()

  const [allHouses, setAllHouses] = useState<House[]>(DEMO_HOUSES)
  const [query, setQuery] = useState('')
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null)
  const [resetKey, setResetKey] = useState(0)

  const [placementMode, setPlacementMode] = useState(false)
  const [placementPin, setPlacementPin] = useState<PlacementPin | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetch('/api/houses')
      .then((res) => res.json())
      .then((data) => {
        if (data.houses) {
          setAllHouses(mergeHouses(data.houses))
        }
      })
      .catch(() => {
        // Demo houses remain as fallback
      })
  }, [])

  const filteredHouses = useMemo(() => {
    const list = query.trim() ? searchHouses(query, allHouses) : allHouses
    return [...list].sort((a, b) => Number(b.featured) - Number(a.featured))
  }, [query, allHouses])

  const openHouse = useCallback(
    (house: House) => {
      router.push(`/${locale}/house/${house.slug}`)
    },
    [locale, router]
  )

  const handleSelect = useCallback((house: House) => {
    setSelectedHouse(house)
    setQuery(house.address)
  }, [])

  const resetToPlavnieki = () => {
    setSelectedHouse(null)
    setQuery('')
    setPlacementMode(false)
    setPlacementPin(null)
    setShowCreateModal(false)
    setResetKey((k) => k + 1)
  }

  const startPlacement = () => {
    setPlacementMode(true)
    setPlacementPin(null)
    setShowCreateModal(false)
  }

  const cancelPlacement = () => {
    setPlacementMode(false)
    setPlacementPin(null)
    setShowCreateModal(false)
  }

  const handleMapClick = (lat: number, lng: number) => {
    setPlacementPin({ lat, lng })
    setShowCreateModal(true)
  }

  const handleHouseCreated = (house: House) => {
    setAllHouses((prev) => {
      const rest = prev.filter((h) => h.slug !== house.slug)
      return [house, ...rest]
    })
    setPlacementMode(false)
    setPlacementPin(null)
    setShowCreateModal(false)
    toast.success(tCreate('success'))
    router.push(`/${locale}/house/${house.slug}`)
  }

  return (
    <div className="map-search">
      <div className="map-search-hero">
        <div className="flex items-center gap-2 text-xs tracking-[3px] text-muted uppercase mb-2">
          <MapPin className="h-3.5 w-3.5" />
          {t('district')}
        </div>
        <h1 className="text-2xl md:text-4xl font-semibold tracking-tight text-ink leading-tight">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted max-w-xl">
          {t('subtitle')}
        </p>
      </div>

      <div className="map-search-bar-wrapper">
        <AddressAutocomplete
          houses={allHouses}
          value={query}
          onChange={setQuery}
          onSelect={handleSelect}
          onOpen={openHouse}
          selectedSlug={selectedHouse?.slug}
        />
      </div>

      <div className="map-search-layout">
        <div className="map-search-map-card">
          <div className="map-search-map-toolbar">
            <span className="text-xs font-medium text-muted">
              {filteredHouses.length} {t('housesOnMap')}
            </span>
            <button
              type="button"
              onClick={resetToPlavnieki}
              className="map-search-reset-btn"
            >
              <Navigation className="h-3.5 w-3.5" />
              {t('resetView')}
            </button>
          </div>

          <HouseMap
            houses={filteredHouses}
            selectedHouse={selectedHouse}
            resetKey={resetKey}
            placementMode={placementMode}
            placementPin={placementPin}
            onMapClick={handleMapClick}
            onTogglePlacement={startPlacement}
            onCancelPlacement={cancelPlacement}
            onHouseSelect={handleSelect}
            onHouseOpen={openHouse}
            addHouseLabel={t('addHouse')}
            placementHint={t('placementHint')}
            cancelPlacementLabel={t('cancelPlacement')}
            openLabel={t('openHouse')}
            apartmentsLabel={t('apartments')}
            floorsLabel={tCreate('floors')}
            yearBuiltLabel={tCreate('yearBuilt')}
            entrancesLabel={t('entrances')}
          />
        </div>

        <div className="map-search-mobile-list md:hidden">
          <div className="flex items-center gap-2 mb-2 px-1">
            <Building2 className="h-4 w-4 text-accent" />
            <h2 className="font-semibold text-sm">{t('nearbyHouses')}</h2>
          </div>
          <div className="map-search-mobile-scroll">
            {filteredHouses.map((house) => (
              <button
                key={house.slug}
                type="button"
                className={cn(
                  'map-search-mobile-chip',
                  house.featured && 'map-search-mobile-chip--featured',
                  selectedHouse?.slug === house.slug && 'map-search-mobile-chip--active'
                )}
                onClick={() => openHouse(house)}
              >
                <span className="map-search-mobile-chip-number">{house.houseNumber}</span>
                <span className="map-search-mobile-chip-street">{house.street}</span>
              </button>
            ))}
          </div>
        </div>

        <aside className="map-search-sidebar">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-accent" />
            <h2 className="font-semibold text-sm">{t('nearbyHouses')}</h2>
          </div>

          <button
            type="button"
            className="map-sidebar-add-btn"
            onClick={startPlacement}
          >
            <span className="text-lg leading-none">+</span>
            {t('addHouse')}
          </button>

          <div className="map-search-list">
            {filteredHouses.map((house) => (
              <button
                key={house.slug}
                type="button"
                className={cn(
                  'map-search-list-item',
                  house.featured && 'map-search-list-item--featured',
                  house.fromDb && 'map-search-list-item--new',
                  selectedHouse?.slug === house.slug && 'map-search-list-item--active'
                )}
                onClick={() => openHouse(house)}
              >
                <div
                  className={cn(
                    'map-search-list-number',
                    house.featured && 'map-search-list-number--featured'
                  )}
                >
                  {house.houseNumber}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="font-medium text-sm leading-tight">{house.street}</div>
                  <div className="text-xs text-muted mt-0.5">
                    {house.apartmentCount} {t('apartments')}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedHouse && (
            <div className="map-search-selected-card">
              <div className="text-xs text-muted uppercase tracking-wide mb-1">
                {selectedHouse.district}
              </div>
              <div className="font-semibold text-lg leading-tight">
                {selectedHouse.street} {selectedHouse.houseNumber}
              </div>
              <p className="text-sm text-muted mt-1">
                {selectedHouse.apartmentCount} {t('apartments')}
                {selectedHouse.entranceCount ? ` · ${selectedHouse.entranceCount} ${t('entrances').toLowerCase()}` : ''}
                {selectedHouse.floors ? ` · ${selectedHouse.floors} ${tCreate('floors').toLowerCase()}` : ''}
              </p>
              <button
                type="button"
                className="btn btn-primary w-full mt-4"
                onClick={() => openHouse(selectedHouse)}
              >
                {t('openHouse')}
              </button>
            </div>
          )}
        </aside>
      </div>

      <p className="map-search-hint">
        {t('hint')} · {PLAVNIEKI_CENTER.lat.toFixed(2)}, {PLAVNIEKI_CENTER.lng.toFixed(2)}
      </p>

      <CreateHouseModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          if (!placementPin) setPlacementMode(false)
        }}
        pin={placementPin}
        onCreated={handleHouseCreated}
      />
    </div>
  )
}