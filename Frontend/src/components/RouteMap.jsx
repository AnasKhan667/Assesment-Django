import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Map as MapIcon, Navigation, Layers } from 'lucide-react';

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
        width: ${isFuel ? '26px' : '30px'};
        height: ${isFuel ? '26px' : '30px'};
        border-radius: 9999px;
        border: 2.5px solid white;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-family: inherit;
        font-size: ${isFuel ? '11px' : '12px'};
      ">
        ${label}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

const startPin = createCustomPin('#10b981', 'A');
const finishPin = createCustomPin('#ef4444', 'B');

function MapController({ bounds, selectedStop }) {
  const map = useMap();

  useEffect(() => {
    if (selectedStop) {
      map.flyTo([selectedStop.truck_stop.latitude, selectedStop.truck_stop.longitude], 11, {
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
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
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
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
            <MapIcon className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Highway Corridor & Refueling Geography
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] text-slate-600 font-semibold">Origin (Full)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-[11px] text-slate-600 font-semibold">Fuel Stop</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-[11px] text-slate-600 font-semibold">Destination</span>
          </div>
        </div>
      </div>

      {/* Map Viewport with CartoDB Voyager tiles */}
      <div className="relative">
        <MapContainer
          center={startCoord}
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: '560px', width: '100%' }}
        >
          <MapController bounds={bounds} selectedStop={selectedStop} />

          {/* CartoDB Voyager Clean High-Res Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Polyline Route in Vibrant Electric Blue */}
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
              <div className="p-3 min-w-[210px]">
                <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Trip Origin
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1">{route.start_location.query}</div>
                <div className="text-xs text-slate-500 mt-1">Vehicle departs with 100% full fuel tank (500 mi range).</div>
              </div>
            </Popup>
          </Marker>

          {/* Finish Marker */}
          <Marker position={finishCoord} icon={finishPin}>
            <Popup>
              <div className="p-3 min-w-[210px]">
                <div className="text-[10px] uppercase font-bold tracking-wider text-rose-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Trip Destination
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1">{route.finish_location.query}</div>
                <div className="text-xs text-slate-500 mt-1">Total route distance: {route.total_distance_miles} miles.</div>
              </div>
            </Popup>
          </Marker>

          {/* Refuel Stop Markers */}
          {stops &&
            stops.map((stop) => {
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
                    <div className="p-3 min-w-[230px]">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 flex items-center gap-1">
                          Fuel Stop #{stop.stop_index}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ${Number(stop.truck_stop.retail_price).toFixed(3)}/gal
                        </span>
                      </div>

                      <div className="text-sm font-bold text-slate-900 mt-2 leading-snug">
                        {stop.truck_stop.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {stop.truck_stop.city}, {stop.truck_stop.state}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Fuel to Fill</span>
                          <strong className="text-slate-800 font-mono">{stop.gallons_to_fill.toFixed(1)} gal</strong>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Stop Cost</span>
                          <strong className="text-emerald-700 font-mono">${stop.cost.toFixed(2)}</strong>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-400 text-right font-mono">
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
