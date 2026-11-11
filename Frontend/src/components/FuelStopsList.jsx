import React, { useState } from 'react';
import { Fuel, CheckCircle2, Search, ExternalLink, Sparkles, MapPin } from 'lucide-react';

export default function FuelStopsList({ stops, selectedStop, onSelectStop }) {
  const [query, setQuery] = useState('');

  if (!stops || stops.length === 0) {
    return (
      <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-8 text-center backdrop-blur-sm">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-emerald-300">Direct Route — Zero Refueling Stops Required</h4>
        <p className="text-xs text-emerald-400/80 max-w-md mx-auto mt-1 leading-relaxed">
          The calculated route distance is within the vehicle's 500-mile single-tank threshold. Departing with a full tank achieves the destination without refueling.
        </p>
      </div>
    );
  }

  // Find minimum price among stops to badge it as "Lowest Price"
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
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Header with Search */}
      <div className="px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Fuel className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Turn-by-Turn Refueling Dispatch Schedule ({stops.length} Stops)
          </h3>
        </div>

        {/* Filter input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter stops by city, state, brand..."
            className="w-full sm:w-64 pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Stop</th>
              <th className="py-3 px-4">Truck Stop Station</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Retail Price</th>
              <th className="py-3 px-4">Fuel to Add</th>
              <th className="py-3 px-4">Stop Cost</th>
              <th className="py-3 px-4">Route Milepost</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-medium">
            {filteredStops.map((stop) => {
              const isBestPrice = Number(stop.truck_stop.retail_price) === minPrice;
              const isSelected = selectedStop && selectedStop.stop_index === stop.stop_index;

              return (
                <tr
                  key={stop.stop_index}
                  onClick={() => onSelectStop && onSelectStop(stop)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-950/40 border-l-2 border-blue-500'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  {/* Stop Index */}
                  <td className="py-3 px-4">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center justify-center font-mono">
                      {stop.stop_index}
                    </span>
                  </td>

                  {/* Name & Address */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{stop.truck_stop.name}</span>
                      {isBestPrice && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <Sparkles className="w-2.5 h-2.5" /> Best Price
                        </span>
                      )}
                    </div>
                    {stop.truck_stop.address && (
                      <div className="text-[11px] text-slate-500 mt-0.5">{stop.truck_stop.address}</div>
                    )}
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4 text-slate-300">
                    {stop.truck_stop.city}, <strong className="text-white">{stop.truck_stop.state}</strong>
                  </td>

                  {/* Retail Price */}
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      ${Number(stop.truck_stop.retail_price).toFixed(3)}
                    </span>
                  </td>

                  {/* Gallons Added */}
                  <td className="py-3 px-4 font-mono text-slate-200">
                    {stop.gallons_to_fill.toFixed(1)} gal
                  </td>

                  {/* Cost */}
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    ${stop.cost.toFixed(2)}
                  </td>

                  {/* Distance along route */}
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {Math.round(stop.distance_along_route_miles)} mi
                  </td>

                  {/* Map Pin Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStop && onSelectStop(stop);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors text-[11px] font-semibold border border-slate-700"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Pin</span>
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
