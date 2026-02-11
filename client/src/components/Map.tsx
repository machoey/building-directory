/**
 * GOOGLE MAPS FRONTEND INTEGRATION - ESSENTIAL GUIDE
 *
 * USAGE FROM PARENT COMPONENT:
 * ======
 *
 * const mapRef = useRef<google.maps.Map | null>(null);
 *
 * <MapView
 *   initialCenter={{ lat: 40.7128, lng: -74.0060 }}
 *   initialZoom={15}
 *   onMapReady={(map) => {
 *     mapRef.current = map; // Store to control map from parent anytime, google map itself is in charge of the re-rendering, not react state.
 * </MapView>
 *
 * ======
 * Available Libraries and Core Features:
 * -------------------------------
 * 📍 MARKER (from `marker` library)
 * - Attaches to map using { map, position }
 * new google.maps.marker.AdvancedMarkerElement({
 *   map,
 *   position: { lat: 37.7749, lng: -122.4194 },
 *   title: "San Francisco",
 * });
 *
 * -------------------------------
 * 🏢 PLACES (from `places` library)
 * - Does not attach directly to map; use data with your map manually.
 * const place = new google.maps.places.Place({ id: PLACE_ID });
 * await place.fetchFields({ fields: ["displayName", "location"] });
 * map.setCenter(place.location);
 * new google.maps.marker.AdvancedMarkerElement({ map, position: place.location });
 *
 * -------------------------------
 * 🧭 GEOCODER (from `geocoding` library)
 * - Standalone service; manually apply results to map.
 * const geocoder = new google.maps.Geocoder();
 * geocoder.geocode({ address: "New York" }, (results, status) => {
 *   if (status === "OK" && results[0]) {
 *     map.setCenter(results[0].geometry.location);
 *     new google.maps.marker.AdvancedMarkerElement({
 *       map,
 *       position: results[0].geometry.location,
 *     });
 *   }
 * });
 *
 * -------------------------------
 * 📐 GEOMETRY (from `geometry` library)
 * - Pure utility functions; not attached to map.
 * const dist = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
 *
 * -------------------------------
 * 🛣️ ROUTES (from `routes` library)
 * - Combines DirectionsService (standalone) + DirectionsRenderer (map-attached)
 * const directionsService = new google.maps.DirectionsService();
 * const directionsRenderer = new google.maps.DirectionsRenderer({ map });
 * directionsService.route(
 *   { origin, destination, travelMode: "DRIVING" },
 *   (res, status) => status === "OK" && directionsRenderer.setDirections(res)
 * );
 *
 * -------------------------------
 * 🌦️ MAP LAYERS (attach directly to map)
 * - new google.maps.TrafficLayer().setMap(map);
 * - new google.maps.TransitLayer().setMap(map);
 * - new google.maps.BicyclingLayer().setMap(map);
 *
 * -------------------------------
 * ✅ SUMMARY
 * - “map-attached” → AdvancedMarkerElement, DirectionsRenderer, Layers.
 * - “standalone” → Geocoder, DirectionsService, DistanceMatrixService, ElevationService.
 * - “data-only” → Place, Geometry utilities.
 */

/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: typeof google;
  }
}

const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

function loadMapScript() {
  return new Promise(resolve => {
    const script = document.createElement("script");
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      resolve(null);
      script.remove(); // Clean up immediately
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
    };
    document.head.appendChild(script);
  });
}

import type { Building } from "@/types/building";

interface MapViewProps {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  buildings?: Building[];
  selectedBuilding?: Building | null;
  hoveredBuilding?: Building | null;
  onBuildingClick?: (building: Building) => void;
  onMapReady?: (map: google.maps.Map) => void;
}

export function MapView({
  className,
  initialCenter = { lat: 37.7749, lng: -122.4194 },
  initialZoom = 12,
  buildings = [],
  selectedBuilding,
  hoveredBuilding,
  onBuildingClick,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const infoWindow = useRef<google.maps.InfoWindow | null>(null);

  const init = usePersistFn(async () => {
    await loadMapScript();
    if (!mapContainer.current) {
      console.error("Map container not found");
      return;
    }
    map.current = new window.google.maps.Map(mapContainer.current, {
      zoom: initialZoom,
      center: initialCenter,
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControl: true,
      streetViewControl: true,
      mapId: "DEMO_MAP_ID",
    });
    if (onMapReady) {
      onMapReady(map.current);
    }
  });

  useEffect(() => {
    init();
  }, [init]);

  // Create markers for buildings
  useEffect(() => {
    if (!map.current || !window.google || buildings.length === 0) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.map = null);
    markers.current.clear();

    // Create new markers
    buildings.forEach(building => {
      if (!building.latitude || !building.longitude) return;

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map: map.current!,
        position: { lat: building.latitude, lng: building.longitude },
        title: building.name,
      });

      // Add hover listener to show info window
      marker.addListener("mouseover", () => {
        // Create info window if it doesn't exist
        if (!infoWindow.current) {
          infoWindow.current = new window.google.maps.InfoWindow();
        }

        // Build info window content
        const contentString = `
          <div style="padding: 12px; max-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${building.name || 'Unknown Building'}</h3>
            <div style="font-size: 14px; color: #6b7280; line-height: 1.6;">
              ${building.address ? `<p style="margin: 4px 0;"><strong>Address:</strong> ${building.address.length > 60 ? building.address.substring(0, 60) + '...' : building.address}</p>` : ''}
              ${building.totalUnits ? `<p style="margin: 4px 0;"><strong>Units:</strong> ${building.totalUnits}</p>` : ''}
              ${building.yearBuilt ? `<p style="margin: 4px 0;"><strong>Built:</strong> ${building.yearBuilt}</p>` : ''}
              ${building.hoaMonthlyFee ? `<p style="margin: 4px 0;"><strong>HOA:</strong> $${building.hoaMonthlyFee.toLocaleString()}/month</p>` : ''}
            </div>
            <button 
              onclick="window.dispatchEvent(new CustomEvent('building-detail-click', { detail: '${building.id}' }))"
              style="margin-top: 12px; padding: 6px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; width: 100%;"
              onmouseover="this.style.background='#1d4ed8'"
              onmouseout="this.style.background='#2563eb'"
            >
              View Details
            </button>
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
  }, [buildings, onBuildingClick]);

  // Highlight hovered building
  useEffect(() => {
    if (!map.current || !window.google) return;

    markers.current.forEach((marker, buildingId) => {
      const isHovered = hoveredBuilding?.id === buildingId;
      const isSelected = selectedBuilding?.id === buildingId;
      
      // Create custom marker content with styling
      const content = document.createElement("div");
      content.style.width = isHovered || isSelected ? "16px" : "12px";
      content.style.height = isHovered || isSelected ? "16px" : "12px";
      content.style.borderRadius = "50%";
      content.style.backgroundColor = isSelected ? "#2563eb" : isHovered ? "#3b82f6" : "#ef4444";
      content.style.border = "2px solid white";
      content.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
      content.style.transition = "all 0.2s ease";
      content.style.cursor = "pointer";
      
      marker.content = content;

      // Pan to hovered building
      if (isHovered && hoveredBuilding?.latitude && hoveredBuilding?.longitude) {
        map.current!.panTo({ lat: hoveredBuilding.latitude, lng: hoveredBuilding.longitude });
      }
    });
  }, [hoveredBuilding, selectedBuilding]);

  return (
    <div ref={mapContainer} className={cn("w-full h-[500px]", className)} />
  );
}
