import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Map as MapIcon, Navigation, Layers, Compass } from 'lucide-react';

// Fix Leaflet marker icons when bundled with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored pin icons with glow & labels
const createCustomPin = (color, bgRing, label) => {
  return new L.DivIcon({
    className: 'custom-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 9999px;
        border: 2.5px solid white;
        box-shadow: 0 0 12px ${bgRing}, 0 4px 6px -1px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-family: inherit;
        font-size: 11px;
      ">
        ${label}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const startPin = createCustomPin('#10b981', 'rgba(16, 185, 129, 0.6)', 'S');
const finishPin = createCustomPin('#ef4444', 'rgba(239, 68, 68, 0.6)', 'D');

function MapController({ bounds, selectedStop }) {
  const map = useMap();

  useEffect(() => {
    if (selectedStop) {
      map.flyTo([selectedStop.truck_stop.latitude, selectedStop.truck_stop.longitude], 10, {
        duration: 1.2,
      });
    } else if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, selectedStop, map]);

  return null;
}

export default function RouteMap({ route, stops, selectedStop, onSelectStop }) {
  const markerRefs = useRef({});

  useEffect(() => {
    if (selectedStop && markerRefs.current[selectedStop.stop_index]) {
      markerRefs.current[selectedStop.stop_index].openPopup();
    }
  }, [selectedStop]);

  if (!route || !route.coordinates || route.coordinates.length === 0) {
    return (
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-12 text-center backdrop-blur-sm">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-500 mb-3 shadow-inner">
          <MapIcon className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-white">Geographic Map Inactive</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
          Specify a start and destination in the route planner to generate the route geometry and visualize optimal truck stops.
        </p>
      </div>
    );
  }

  const positions = route.coordinates;
  const startCoord = route.start_location.coordinates;
  const finishCoord = route.finish_location.coordinates;
  const bounds = [startCoord, finishCoord, ...positions];

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Map Bar */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <MapIcon className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Highway Corridor & Refueling Geography
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-medium text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20"></span>
            <span className="text-[11px] text-slate-400">Start (Full Tank)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20"></span>
            <span className="text-[11px] text-slate-400">Optimal Fuel Stop</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/20"></span>
            <span className="text-[11px] text-slate-400">Destination</span>
          </div>
        </div>
      </div>

      {/* Map Viewport */}
      <div className="relative">
        <MapContainer
          center={startCoord}
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: '560px', width: '100%' }}
        >
          <MapController bounds={bounds} selectedStop={selectedStop} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Polyline Route */}
          <Polyline
            positions={positions}
            color="#2563eb"
            weight={6}
            opacity={0.9}
            lineCap="round"
            lineJoin="round"
          />

          {/* Start Pin */}
          <Marker position={startCoord} icon={startPin}>
            <Popup>
              <div className="p-3 bg-slate-900 text-white rounded-xl min-w-[200px]">
                <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Origin Departure
                </div>
                <div className="text-sm font-bold text-white mt-1">{route.start_location.query}</div>
                <div className="text-xs text-slate-400 mt-1">Vehicle starts with 100% full fuel tank (500 mi range).</div>
              </div>
            </Popup>
          </Marker>

          {/* Destination Pin */}
          <Marker position={finishCoord} icon={finishPin}>
            <Popup>
              <div className="p-3 bg-slate-900 text-white rounded-xl min-w-[200px]">
                <div className="text-[10px] uppercase font-bold tracking-wider text-rose-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span> Final Destination
                </div>
                <div className="text-sm font-bold text-white mt-1">{route.finish_location.query}</div>
                <div className="text-xs text-slate-400 mt-1">Total route distance: {route.total_distance_miles} miles.</div>
              </div>
            </Popup>
          </Marker>

          {/* Fuel Stops Pins */}
          {stops &&
            stops.map((stop) => {
              const stopPin = createCustomPin('#f59e0b', 'rgba(245, 158, 11, 0.6)', stop.stop_index);
              return (
                <Marker
                  key={stop.stop_index}
                  position={[stop.truck_stop.latitude, stop.truck_stop.longitude]}
                  icon={stopPin}
                  ref={(ref) => {
                    if (ref) markerRefs.current[stop.stop_index] = ref;
                  }}
                  eventHandlers={{
                    click: () => onSelectStop && onSelectStop(stop),
                  }}
                >
                  <Popup>
                    <div className="p-3.5 bg-slate-900 text-white rounded-xl min-w-[240px]">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
                          Refuel Stop #{stop.stop_index}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                          ${Number(stop.truck_stop.retail_price).toFixed(3)}/gal
                        </span>
                      </div>

                      <div className="text-sm font-bold text-white mt-2 leading-snug">
                        {stop.truck_stop.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {stop.truck_stop.city}, {stop.truck_stop.state}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px] uppercase">Fuel Added</span>
                          <strong className="text-white font-mono">{stop.gallons_to_fill.toFixed(1)} gal</strong>
                        </div>
                        <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px] uppercase">Stop Cost</span>
                          <strong className="text-emerald-400 font-mono">${stop.cost.toFixed(2)}</strong>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-500 text-right font-mono">
                        Route Milepost: {Math.round(stop.distance_along_route_miles)} mi
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
