"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Helper: extract [lat, lng] from Fleetbase GeoJSON location objects
function getLatLng(place?: any): [number, number] | null {
  if (!place) return null;
  // Fleetbase format: { location: { type: 'Point', coordinates: [lng, lat] } }
  const coords = place?.location?.coordinates;
  if (coords && Array.isArray(coords) && coords.length >= 2) {
    return [coords[1], coords[0]]; // GeoJSON is [lng, lat] → Leaflet needs [lat, lng]
  }
  // Fallback: flat latitude/longitude
  if (place.latitude != null && place.longitude != null) {
    return [place.latitude, place.longitude];
  }
  return null;
}

const DARK_TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const DEFAULT_VEHICLE_ICON = "https://flb-assets.s3-ap-southeast-1.amazonaws.com/static/vehicle-icons/mini_bus.svg";

interface MapProps {
  order: any;
  driver?: any;
}

export default function TrackingMap({ order, driver }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current || mapRef.current) return;

    // Determine initial center
    const driverLatLng = getLatLng(order.tracker_data?.driver_current_location)
      || getLatLng(driver);
    const pickupLatLng = getLatLng(order.payload?.pickup);
    const dropoffLatLng = getLatLng(order.payload?.dropoff);

    const center: [number, number] = driverLatLng || pickupLatLng || dropoffLatLng || [36.7783, -119.4179];

    const map = L.map(containerRef.current, {
      center,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(DARK_TILE_URL, {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    mapRef.current = map;

    // Draw route and markers
    drawRoute(map, order, driver);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
    />
  );
}

function drawRoute(map: L.Map, order: any, driver?: any) {
  const driverLatLng = getLatLng(order.tracker_data?.driver_current_location)
    || getLatLng(driver);
  const pickupLatLng = getLatLng(order.payload?.pickup);
  const dropoffLatLng = getLatLng(order.payload?.dropoff);
  const waypoints = order.payload?.waypoints || [];

  // Build route points — START FROM DRIVER LOCATION (Onfleet-style)
  const routePoints: [number, number][] = [];

  // Driver's current position is the starting point
  if (driverLatLng) {
    routePoints.push(driverLatLng);
  } else if (pickupLatLng) {
    routePoints.push(pickupLatLng);
  }

  // Add remaining waypoints
  waypoints.forEach((wp: any) => {
    const wpLatLng = getLatLng(wp);
    if (wpLatLng) routePoints.push(wpLatLng);
  });

  // Add dropoff (final destination)
  if (dropoffLatLng) {
    routePoints.push(dropoffLatLng);
  }

  // Draw route polyline (only if we have at least 2 points)
  if (routePoints.length >= 2) {
    const routeLine = L.polyline(routePoints, {
      color: "#22c55e",
      weight: 4,
      opacity: 0.85,
      dashArray: "8 12",
      lineCap: "round",
    }).addTo(map);

    map.fitBounds(routeLine.getBounds(), {
      padding: [60, 60],
      maxZoom: 14,
    });
  } else if (routePoints.length === 1) {
    // Only one point — just center on it
    map.setView(routePoints[0]!, 14);
  }

  // Driver marker
  if (driver && driverLatLng) {
    const vehicleIcon = L.icon({
      iconUrl: driver.vehicle_avatar || DEFAULT_VEHICLE_ICON,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const driverMarker = L.marker(driverLatLng, { icon: vehicleIcon }).addTo(map);

    driverMarker.bindTooltip(
      `<div style="font-size:12px;font-weight:600">${driver.name || "Driver"}</div><div style="font-size:11px;color:${driver.online ? "#22c55e" : "#ef4444"}">${driver.online ? "Online" : "Offline"}</div>`,
      { permanent: false, direction: "top", offset: [0, -20] }
    );
  }

  // Destination marker
  if (dropoffLatLng) {
    const destIcon = L.divIcon({
      html: `<div style="width:24px;height:24px;border-radius:50%;background:#22c55e;border:3px solid #fff;box-shadow:0 0 12px rgba(34,197,94,0.7);display:flex;align-items:center;justify-content:center">
        <svg width="10" height="10" viewBox="0 0 384 512" fill="#fff"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: "",
    });

    const dropoff = order.payload?.dropoff;
    const label = dropoff?.address || "Destination";

    L.marker(dropoffLatLng, { icon: destIcon })
      .addTo(map)
      .bindTooltip(label, { permanent: false, direction: "top", offset: [0, -16] });
  }

  // Pickup marker (show if driver location is different)
  if (pickupLatLng && !driverLatLng) {
    const pickupIcon = L.divIcon({
      html: `<div style="width:20px;height:20px;border-radius:50%;background:#22c55e;opacity:0.6;border:3px solid #fff;box-shadow:0 0 8px rgba(34,197,94,0.5)"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      className: "",
    });

    L.marker(pickupLatLng, { icon: pickupIcon })
      .addTo(map)
      .bindTooltip("Pickup", { permanent: false, direction: "top", offset: [0, -14] });
  }
}
