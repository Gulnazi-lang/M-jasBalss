'use client'

import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap, useMapEvents } from 'react-leaflet'
import type { Marker as LeafletMarker } from 'leaflet'
import L from 'leaflet'
import { Plus, X } from 'lucide-react'
import type { House } from '@/lib/houses'
import { PLAVNIEKI_CENTER } from '@/lib/houses'
import type { PlacementPin } from './CreateHouseModal'

function createHouseIcon(houseNumber: string, isSelected: boolean, featured?: boolean) {
  const size = houseNumber.length > 2 ? 42 : 38
  const fontSize = houseNumber.length > 2 ? 11 : 13
  const extra = `${isSelected ? ' selected' : ''}${featured ? ' featured' : ''}`

  return L.divIcon({
    className: '',
    html: `<div class="house-marker${extra}" style="width:${size}px;height:${size}px;font-size:${fontSize}px">${houseNumber}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

const placementIcon = L.divIcon({
  className: '',
  html: '<div class="placement-pin"><div class="placement-pin-dot"></div><div class="placement-pin-pulse"></div></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

function MapFlyTo({ house, resetKey }: { house: House | null; resetKey: number }) {
  const map = useMap()

  useEffect(() => {
    if (house) {
      map.flyTo([house.lat, house.lng], 18, { duration: 0.8 })
    }
  }, [house, map])

  useEffect(() => {
    if (resetKey > 0) {
      map.flyTo([PLAVNIEKI_CENTER.lat, PLAVNIEKI_CENTER.lng], PLAVNIEKI_CENTER.zoom, { duration: 0.8 })
    }
  }, [resetKey, map])

  return null
}

function MapClickHandler({
  enabled,
  onClick,
}: {
  enabled: boolean
  onClick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      if (enabled) {
        onClick(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

type HouseMarkerProps = {
  house: House
  icon: L.DivIcon
  isSelected: boolean
  placementMode: boolean
  onHouseSelect: (house: House) => void
  onHouseOpen: (house: House) => void
  openLabel: string
  apartmentsLabel: string
  floorsLabel: string
  yearBuiltLabel: string
  entrancesLabel: string
}

function HouseMarker({
  house,
  icon,
  isSelected,
  placementMode,
  onHouseSelect,
  onHouseOpen,
  openLabel,
  apartmentsLabel,
  floorsLabel,
  yearBuiltLabel,
  entrancesLabel,
}: HouseMarkerProps) {
  const markerRef = useRef<LeafletMarker | null>(null)

  useEffect(() => {
    if (isSelected) {
      markerRef.current?.openPopup()
    }
  }, [isSelected])

  return (
    <Marker
      ref={markerRef}
      position={[house.lat, house.lng]}
      icon={icon}
      eventHandlers={{
        click: () => {
          if (placementMode) return
          onHouseSelect(house)
        },
      }}
    >
      <Popup className="house-popup">
        <div className="house-popup-content">
          <div className="house-popup-number">{house.houseNumber}</div>
          <div className="house-popup-street">{house.street}</div>
          <div className="house-popup-meta">
            {house.district} · {house.apartmentCount} {apartmentsLabel}
          </div>
          {(house.yearBuilt || house.floors || house.entranceCount) && (
            <div className="house-popup-details">
              {house.entranceCount && (
                <span>
                  {entrancesLabel}: {house.entranceCount}
                </span>
              )}
              {house.floors && (
                <span>
                  {floorsLabel}: {house.floors}
                </span>
              )}
              {house.yearBuilt && (
                <span>
                  {yearBuiltLabel}: {house.yearBuilt}
                </span>
              )}
            </div>
          )}
          <button
            type="button"
            className="house-popup-btn"
            onClick={() => onHouseOpen(house)}
          >
            {openLabel}
          </button>
        </div>
      </Popup>
    </Marker>
  )
}

type HouseMapProps = {
  houses: House[]
  selectedHouse: House | null
  resetKey: number
  placementMode: boolean
  placementPin: PlacementPin | null
  onMapClick: (lat: number, lng: number) => void
  onTogglePlacement: () => void
  onCancelPlacement: () => void
  onHouseSelect: (house: House) => void
  onHouseOpen: (house: House) => void
  addHouseLabel: string
  placementHint: string
  cancelPlacementLabel: string
  openLabel: string
  apartmentsLabel: string
  floorsLabel: string
  yearBuiltLabel: string
  entrancesLabel: string
}

export default function HouseMap({
  houses,
  selectedHouse,
  resetKey,
  placementMode,
  placementPin,
  onMapClick,
  onTogglePlacement,
  onCancelPlacement,
  onHouseSelect,
  onHouseOpen,
  addHouseLabel,
  placementHint,
  cancelPlacementLabel,
  openLabel,
  apartmentsLabel,
  floorsLabel,
  yearBuiltLabel,
  entrancesLabel,
}: HouseMapProps) {
  const markers = useMemo(
    () =>
      houses.map((house) => ({
        house,
        icon: createHouseIcon(house.houseNumber, selectedHouse?.slug === house.slug, house.featured),
      })),
    [houses, selectedHouse?.slug]
  )

  return (
    <div className={`house-map-wrapper${placementMode ? ' house-map-wrapper--placement' : ''}`}>
      <div className="house-map-controls">
        {placementMode ? (
          <button type="button" className="house-map-add-btn house-map-add-btn--active" onClick={onCancelPlacement}>
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">{cancelPlacementLabel}</span>
          </button>
        ) : (
          <button type="button" className="house-map-add-btn" onClick={onTogglePlacement}>
            <Plus className="h-4 w-4" />
            <span>{addHouseLabel}</span>
          </button>
        )}
      </div>

      {placementMode && (
        <div className="house-map-placement-banner">
          <MapPinIcon />
          <span>{placementHint}</span>
        </div>
      )}

      <MapContainer
        center={[PLAVNIEKI_CENTER.lat, PLAVNIEKI_CENTER.lng]}
        zoom={PLAVNIEKI_CENTER.zoom}
        className="house-map-container"
        zoomControl={false}
        scrollWheelZoom
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapFlyTo house={selectedHouse} resetKey={resetKey} />
        <MapClickHandler enabled={placementMode} onClick={onMapClick} />

        {placementPin && (
          <Marker position={[placementPin.lat, placementPin.lng]} icon={placementIcon} />
        )}

        {markers.map(({ house, icon }) => (
          <HouseMarker
            key={house.slug}
            house={house}
            icon={icon}
            isSelected={selectedHouse?.slug === house.slug}
            placementMode={placementMode}
            onHouseSelect={onHouseSelect}
            onHouseOpen={onHouseOpen}
            openLabel={openLabel}
            apartmentsLabel={apartmentsLabel}
            floorsLabel={floorsLabel}
            yearBuiltLabel={yearBuiltLabel}
            entrancesLabel={entrancesLabel}
          />
        ))}
      </MapContainer>
    </div>
  )
}

function MapPinIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}