import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icons when bundled with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored icons
const createCustomIcon = (color) => {
  return new L.DivIcon({
    className: 'custom-pin',
    html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

const startIcon = createCustomIcon('#10b981'); // Emerald
const finishIcon = createCustomIcon('#ef4444'); // Red
const fuelIcon = createCustomIcon('#f59e0b'); // Amber

function ChangeView({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

export default function RouteMap({ route, stops }) {
  if (!route || !route.coordinates || route.coordinates.length === 0) {
    return (
      <div className="card map-card placeholder">
        <p>Enter start and finish locations to visualize your route and fuel stops.</p>
      </div>
    );
  }

  // Route coordinates come as [lat, lon] from backend
  const positions = route.coordinates;
  const startCoord = route.start_location.coordinates;
  const finishCoord = route.finish_location.coordinates;

  const bounds = [startCoord, finishCoord, ...positions];

  return (
    <div className="card map-card">
      <MapContainer
        center={startCoord}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: '520px', width: '100%', borderRadius: '8px' }}
      >
        <ChangeView bounds={bounds} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Line */}
        <Polyline positions={positions} color="#3b82f6" weight={5} opacity={0.8} />

        {/* Start Marker */}
        <Marker position={startCoord} icon={startIcon}>
          <Popup>
            <strong>Start:</strong> {route.start_location.query}
          </Popup>
        </Marker>

        {/* Finish Marker */}
        <Marker position={finishCoord} icon={finishIcon}>
          <Popup>
            <strong>Finish:</strong> {route.finish_location.query}
          </Popup>
        </Marker>

        {/* Optimal Fuel Stops */}
        {stops &&
          stops.map((stop) => {
            const pos = [stop.truck_stop.latitude, stop.truck_stop.longitude];
            return (
              <Marker key={stop.stop_index} position={pos} icon={fuelIcon}>
                <Popup>
                  <div style={{ minWidth: '180px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                      Stop #{stop.stop_index}: {stop.truck_stop.name}
                    </div>
                    <div>{stop.truck_stop.city}, {stop.truck_stop.state}</div>
                    <div style={{ marginTop: '6px', color: '#047857', fontWeight: 'bold' }}>
                      ${Number(stop.truck_stop.retail_price).toFixed(3)} / gal
                    </div>
                    <div>Fill: {stop.gallons_to_fill.toFixed(1)} gal (${stop.cost.toFixed(2)})</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      Mile {Math.round(stop.distance_along_route_miles)} of route
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}

