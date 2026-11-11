import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Map as MapIcon, Navigation } from 'lucide-react';

// Fix Leaflet marker icons when bundled with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom refined map markers
const createCustomPin = (color, label, isFuel = false) => {
  return new L.DivIcon({
    className: 'custom-pin',
    html: `
      <div style="
        background-color: ${color};
        width: ${isFuel ? '24px' : '28px'};
        height: ${isFuel ? '24px' : '28px'};
        border-radius: 9999px;
        border: 2px solid white;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-family: inherit;
        font-size: ${isFuel ? '10px' : '11px'};
      ">
        ${label}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const startPin = createCustomPin('#10b981', 'A');
const finishPin = createCustomPin('#ef4444', 'B');

function MapController({ bounds, selectedStop }) {
  const map = useMap();
  const prevBoundsRef = useRef('');

  useEffect(() => {
    // Invalidate size once on load to prevent grey tile issues
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (selectedStop && selectedStop.truck_stop?.latitude && selectedStop.truck_stop?.longitude) {
      map.flyTo([selectedStop.truck_stop.latitude, selectedStop.truck_stop.longitude], 10, {
        duration: 1.0,
      });
      return;
    }

    if (bounds && bounds.length > 0) {
      const boundsKey = `${bounds[0]?.[0]}_${bounds[bounds.length - 1]?.[0]}_${bounds.length}`;
      if (boundsKey !== prevBoundsRef.current) {
        prevBoundsRef.current = boundsKey;
        try {
          map.fitBounds(bounds, { padding: [40, 40] });
        } catch (e) {
          console.warn('fitBounds error:', e);
        }
      }
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
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center h-full flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center text-slate-400 mb-3">
          <MapIcon className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">Map Visualization Ready</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Input your starting city and destination above to trace the highway path and locate cost-effective fueling stops.
        </p>
      </div>
    );
  }

  const positions = route.coordinates;
  const startCoord = route.start_location.coordinates;
  const finishCoord = route.finish_location.coordinates;
  const bounds = [startCoord, finishCoord, ...positions];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header Bar */}
      <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
            <MapIcon className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Highway Corridor & Refuel Map
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] text-slate-600 font-semibold">Start (Full)</span>
          </div>
          <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-[10px] text-slate-600 font-semibold">Fuel Stop</span>
          </div>
          <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="text-[10px] text-slate-600 font-semibold">Finish</span>
          </div>
        </div>
      </div>

      {/* Map Viewport - 100% Free OpenStreetMap Tiles (Zero API Key Needed) */}
      <div className="relative flex-1 min-h-[560px]">
        <MapContainer
          center={startCoord}
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: '100%', minHeight: '560px', width: '100%' }}
        >
          <MapController bounds={bounds} selectedStop={selectedStop} />

          {/* Standard Free OpenStreetMap - NEVER requires an API key */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Polyline Route in Electric Blue */}
          <Polyline
            positions={positions}
            color="#2563eb"
            weight={5}
            opacity={0.9}
            lineCap="round"
            lineJoin="round"
          />

          {/* Start Marker */}
          <Marker position={startCoord} icon={startPin}>
            <Popup>
              <div className="p-2 min-w-[190px]">
                <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Origin
                </div>
                <div className="text-xs font-bold text-slate-900 mt-1">{route.start_location.query}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Departs with 100% full fuel tank (500 mi range).</div>
              </div>
            </Popup>
          </Marker>

          {/* Finish Marker */}
          <Marker position={finishCoord} icon={finishPin}>
            <Popup>
              <div className="p-2 min-w-[190px]">
                <div className="text-[10px] uppercase font-bold tracking-wider text-rose-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Destination
                </div>
                <div className="text-xs font-bold text-slate-900 mt-1">{route.finish_location.query}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Total trip: {route.total_distance_miles} miles.</div>
              </div>
            </Popup>
          </Marker>

          {/* Refuel Stop Markers */}
          {stops &&
            stops.map((stop) => {
              if (!stop?.truck_stop?.latitude || !stop?.truck_stop?.longitude) return null;
              const stopPin = createCustomPin('#f59e0b', stop.stop_index, true);
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
                    <div className="p-2.5 min-w-[210px]">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 flex items-center gap-1">
                          Stop #{stop.stop_index}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          ${Number(stop.truck_stop.retail_price).toFixed(3)}/gal
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-900 mt-1.5 leading-snug">
                        {stop.truck_stop.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {stop.truck_stop.city}, {stop.truck_stop.state}
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-[11px]">
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-200/80">
                          <span className="text-slate-400 block text-[9px] uppercase font-semibold">Fuel to Add</span>
                          <strong className="text-slate-800 font-mono">{stop.gallons_to_fill.toFixed(1)} gal</strong>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-200/80">
                          <span className="text-slate-400 block text-[9px] uppercase font-semibold">Stop Cost</span>
                          <strong className="text-emerald-700 font-mono">${stop.cost.toFixed(2)}</strong>
                        </div>
                      </div>

                      <div className="mt-1.5 text-[10px] text-slate-400 text-right font-mono">
                        Route Mile: {Math.round(stop.distance_along_route_miles)} mi
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
