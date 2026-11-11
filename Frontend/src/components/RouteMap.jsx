import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Map, Layers } from 'lucide-react';

// Fix Leaflet marker icons when bundled with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored pin icons
const createCustomIcon = (bgColor, label = '') => {
  return new L.DivIcon({
    className: 'custom-pin',
    html: `
      <div style="
        background-color: ${bgColor};
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2.5px solid white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 11px;
      ">
        ${label}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

const startIcon = createCustomIcon('#10b981', 'S');   // Emerald
const finishIcon = createCustomIcon('#ef4444', 'F');  // Red

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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-12 text-center">
        <Map className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-700">No Route Loaded</h4>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
          Select a start and finish location above to visualize the highway route corridor and optimal fuel stops.
        </p>
      </div>
    );
  }

  const positions = route.coordinates;
  const startCoord = route.start_location.coordinates;
  const finishCoord = route.finish_location.coordinates;
  const bounds = [startCoord, finishCoord, ...positions];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden transition-all">
      {/* Map Header with Legend */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">
            Interactive Route Map & Fuel Corridor
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-xs"></span>
            <span>Start</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-xs"></span>
            <span>Fuel Stop</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 border border-white shadow-xs"></span>
            <span>Destination</span>
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative">
        <MapContainer
          center={startCoord}
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: '540px', width: '100%' }}
        >
          <ChangeView bounds={bounds} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Polyline Route */}
          <Polyline positions={positions} color="#3b82f6" weight={5} opacity={0.85} />

          {/* Start Marker */}
          <Marker position={startCoord} icon={startIcon}>
            <Popup>
              <div className="p-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">Trip Origin</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{route.start_location.query}</div>
                <div className="text-xs text-slate-500 mt-1">Vehicle starts with 100% full fuel tank (500 mi range).</div>
              </div>
            </Popup>
          </Marker>

          {/* Finish Marker */}
          <Marker position={finishCoord} icon={finishIcon}>
            <Popup>
              <div className="p-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600">Final Destination</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{route.finish_location.query}</div>
                <div className="text-xs text-slate-500 mt-1">Total trip distance: {route.total_distance_miles} miles.</div>
              </div>
            </Popup>
          </Marker>

          {/* Fuel Stops Markers */}
          {stops &&
            stops.map((stop) => {
              const stopIcon = createCustomIcon('#f59e0b', stop.stop_index);
              return (
                <Marker
                  key={stop.stop_index}
                  position={[stop.truck_stop.latitude, stop.truck_stop.longitude]}
                  icon={stopIcon}
                >
                  <Popup>
                    <div className="p-1 max-w-[220px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600">
                          Fuel Stop #{stop.stop_index}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          ${Number(stop.truck_stop.retail_price).toFixed(3)}/gal
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                        {stop.truck_stop.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {stop.truck_stop.city}, {stop.truck_stop.state}
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <span>Gallons: <strong>{stop.gallons_to_fill.toFixed(1)} gal</strong></span>
                        <span>Cost: <strong>${stop.cost.toFixed(2)}</strong></span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>
    </div>
  );
}
