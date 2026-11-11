import React, { useState } from 'react';
import { Fuel, CheckCircle2, Search, Sparkles, MapPin, X } from 'lucide-react';

export default function FuelStopsList({ stops, selectedStop, onSelectStop }) {
  const [query, setQuery] = useState('');

  if (!stops || stops.length === 0) {
    return (
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-emerald-900">Direct Route — Zero Refueling Required</h4>
        <p className="text-xs text-emerald-700 max-w-sm mx-auto mt-1 leading-relaxed">
          The calculated route distance is within the vehicle's 500-mile single-tank threshold. Departing with a full tank completes the journey without any refueling stops.
        </p>
      </div>
    );
  }

  const minPrice = Math.min(...stops.map((s) => Number(s.truck_stop.retail_price)));

  const filteredStops = stops.filter((s) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      s.truck_stop.name.toLowerCase().includes(q) ||
      s.truck_stop.city.toLowerCase().includes(q) ||
      s.truck_stop.state.toLowerCase().includes(q) ||
      (s.truck_stop.address && s.truck_stop.address.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header Bar */}
      <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
            <Fuel className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Refueling Schedule ({stops.length} Stops)
            </h3>
          </div>
        </div>

        {/* Filter input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3 h-3" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter stops..."
            className="w-44 pl-7 pr-7 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Table Area */}
      <div className="flex-1 overflow-y-auto max-h-[560px] min-h-[500px]">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 sticky top-0 z-10 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Station</th>
              <th className="py-2.5 px-3">Price</th>
              <th className="py-2.5 px-3">Gallons</th>
              <th className="py-2.5 px-3">Cost</th>
              <th className="py-2.5 px-3">Mile</th>
              <th className="py-2.5 px-2 text-right">Map</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredStops.map((stop) => {
              const isBestPrice = Number(stop.truck_stop.retail_price) === minPrice;
              const isSelected = selectedStop && selectedStop.stop_index === stop.stop_index;

              return (
                <tr
                  key={stop.stop_index}
                  onClick={() => onSelectStop && onSelectStop(stop)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50/80 border-l-3 border-blue-600'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Stop Index */}
                  <td className="py-2.5 px-3">
                    <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold flex items-center justify-center font-mono text-[10px]">
                      {stop.stop_index}
                    </span>
                  </td>

                  {/* Name & Location */}
                  <td className="py-2.5 px-3 max-w-[170px]">
                    <div className="font-bold text-slate-900 truncate flex items-center gap-1">
                      <span className="truncate">{stop.truck_stop.name}</span>
                      {isBestPrice && (
                        <span className="shrink-0 inline-flex items-center text-[8px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 py-0.2 rounded">
                          <Sparkles className="w-2 h-2 mr-0.5" /> Best
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {stop.truck_stop.city}, {stop.truck_stop.state}
                    </div>
                  </td>

                  {/* Retail Price */}
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-200 text-[11px]">
                      ${Number(stop.truck_stop.retail_price).toFixed(3)}
                    </span>
                  </td>

                  {/* Gallons */}
                  <td className="py-2.5 px-3 font-mono text-slate-800 text-[11px]">
                    {stop.gallons_to_fill.toFixed(1)}g
                  </td>

                  {/* Cost */}
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-[11px]">
                    ${stop.cost.toFixed(2)}
                  </td>

                  {/* Distance along route */}
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[10px]">
                    {Math.round(stop.distance_along_route_miles)}mi
                  </td>

                  {/* Focus Action */}
                  <td className="py-2.5 px-2 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStop && onSelectStop(stop);
                      }}
                      className="p-1 rounded bg-slate-100 hover:bg-blue-600 text-slate-500 hover:text-white transition-colors"
                      title="Center on Map"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
