import { useEffect, useRef } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

interface Building {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  totalUnits?: number;
  yearBuilt?: number;
  hoaMonthlyFee?: number | string;
  photoUrl?: string;
  photo?: string;
}

interface MapViewProps {
  buildings: Building[];
  onBuildingClick?: (building: Building) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

// Default center: San Mateo, CA
const DEFAULT_CENTER = { lat: 37.5630, lng: -122.3255 };
const DEFAULT_ZOOM = 12;

export function MapView({
  buildings,
  onBuildingClick,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(
    new Map()
  );
  const infoWindow = useRef<google.maps.InfoWindow | null>(null);
  const markerClusterer = useRef<MarkerClusterer | null>(null);

  useEffect(() => {
    if (!mapRef.current || map.current) return;
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not loaded');
      return;
    }

    // Initialize map
    map.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapId: "building_directory_map",
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });
  }, [center, zoom]);

  useEffect(() => {
    if (!map.current || !window.google || !window.google.maps) return;

    // Clear existing markers
    markers.current.forEach((marker) => {
      marker.map = null;
    });
    markers.current.clear();

    // Add markers for buildings with coordinates
    buildings.forEach((building) => {
      if (!building.latitude || !building.longitude) return;

      // Create a smaller custom pin element
      const pinElement = document.createElement('div');
      pinElement.style.width = '12px';
      pinElement.style.height = '12px';
      pinElement.style.backgroundColor = '#dc2626';
      pinElement.style.borderRadius = '50%';
      pinElement.style.border = '2px solid white';
      pinElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      pinElement.style.cursor = 'pointer';
      pinElement.style.transition = 'transform 0.2s';
      
      // Add hover effect
      pinElement.addEventListener('mouseenter', () => {
        pinElement.style.transform = 'scale(1.3)';
      });
      pinElement.addEventListener('mouseleave', () => {
        pinElement.style.transform = 'scale(1)';
      });

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position: { lat: building.latitude, lng: building.longitude },
        title: building.name,
        content: pinElement,
      });

      // Add hover listener using Google Maps API event system
      marker.addListener("mouseover", () => {
        // Create info window if it doesn't exist
        if (!infoWindow.current) {
          infoWindow.current = new window.google.maps.InfoWindow();
        }

        // Build info window content with photo thumbnail
        const photoUrl = building.photoUrl || building.photo || '';
        const contentString = `
          <div style="padding: 0; max-width: 320px; font-family: system-ui, -apple-system, sans-serif;">
            ${photoUrl ? `
              <div style="width: 100%; height: 160px; overflow: hidden; border-radius: 8px 8px 0 0;">
                <img src="${photoUrl}" alt="${building.name || 'Building'}" 
                     style="width: 100%; height: 100%; object-fit: cover;" 
                     onerror="this.parentElement.style.display='none'" />
              </div>
            ` : ''}
            <div style="padding: 12px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${building.name || 'Unknown Building'}</h3>
              <div style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                ${building.address ? `<p style="margin: 4px 0; display: flex; align-items: start;"><span style="margin-right: 4px;">📍</span><span>${building.address.length > 50 ? building.address.substring(0, 50) + '...' : building.address}</span></p>` : ''}
                ${building.totalUnits ? `<p style="margin: 4px 0;"><strong>Units:</strong> ${building.totalUnits}</p>` : ''}
                ${building.yearBuilt ? `<p style="margin: 4px 0;"><strong>Built:</strong> ${building.yearBuilt}</p>` : ''}
                ${building.hoaMonthlyFee ? `<p style="margin: 4px 0;"><strong>HOA:</strong> $${typeof building.hoaMonthlyFee === 'number' ? building.hoaMonthlyFee.toLocaleString() : building.hoaMonthlyFee}/month</p>` : ''}
              </div>
              <button 
                onclick="window.dispatchEvent(new CustomEvent('building-detail-click', { detail: '${building.id}' }))"
                style="margin-top: 12px; padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; width: 100%; transition: background 0.2s;"
                onmouseover="this.style.background='#1d4ed8'"
                onmouseout="this.style.background='#2563eb'"
              >
                View Full Details →
              </button>
            </div>
          </div>
        `;

        infoWindow.current.setContent(contentString);
        infoWindow.current.open({
          anchor: marker,
          map: map.current!,
        });
      });

      // Add mouseout listener to close info window
      marker.addListener("mouseout", () => {
        if (infoWindow.current) {
          infoWindow.current.close();
        }
      });

      // Add click listener to open detail modal
      marker.addListener("click", () => {
        if (onBuildingClick) onBuildingClick(building);
      });

      markers.current.set(building.id, marker);
    });

    // Clear existing clusterer
    if (markerClusterer.current) {
      markerClusterer.current.clearMarkers();
    }

    // Create new clusterer with all markers
    if (markers.current.size > 0) {
      markerClusterer.current = new MarkerClusterer({
        map: map.current!,
        markers: Array.from(markers.current.values()),
        renderer: {
          render: ({ count, position }) => {
            // Create custom red cluster marker
            const svg = `
              <svg fill="#dc2626" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="50" height="50">
                <circle cx="120" cy="120" opacity=".6" r="70" />
                <circle cx="120" cy="120" opacity=".3" r="90" />
                <circle cx="120" cy="120" opacity=".2" r="110" />
              </svg>
            `;
            const clusterElement = document.createElement('div');
            clusterElement.innerHTML = svg;
            clusterElement.style.position = 'relative';
            clusterElement.style.cursor = 'pointer';
            
            // Add count label
            const label = document.createElement('div');
            label.textContent = String(count);
            label.style.position = 'absolute';
            label.style.top = '50%';
            label.style.left = '50%';
            label.style.transform = 'translate(-50%, -50%)';
            label.style.color = 'white';
            label.style.fontSize = '14px';
            label.style.fontWeight = 'bold';
            label.style.fontFamily = 'system-ui, -apple-system, sans-serif';
            clusterElement.appendChild(label);

            return new window.google.maps.marker.AdvancedMarkerElement({
              position,
              content: clusterElement,
              zIndex: Number(window.google.maps.Marker.MAX_ZINDEX) + count,
            });
          },
        },
      });
    }

    // Listen for custom event from info window button
    const handleBuildingDetailClick = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const buildingId = customEvent.detail;
      const building = buildings.find((b) => b.id === buildingId);
      if (building && onBuildingClick) {
        onBuildingClick(building);
      }
    };

    window.addEventListener("building-detail-click", handleBuildingDetailClick);

    return () => {
      window.removeEventListener(
        "building-detail-click",
        handleBuildingDetailClick
      );
    };
  }, [buildings, onBuildingClick]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}
