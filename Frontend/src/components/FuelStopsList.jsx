import React, { useState } from 'react';
import { Fuel, CheckCircle2, Search, Sparkles, MapPin, X } from 'lucide-react';

export default function FuelStopsList({ stops, selectedStop, onSelectStop }) {
  const [query, setQuery] = useState('');

  if (!stops || stops.length === 0) {
    return (
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-8 text-center transition-all">
        <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-emerald-900">Direct Route — Zero Refueling Stops Required</h4>
        <p className="text-xs text-emerald-700 max-w-md mx-auto mt-1 leading-relaxed">
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
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all">
      {/* Table Header with Search */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
            <Fuel className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Refueling Dispatch Schedule ({stops.length} Stops)
          </h3>
        </div>

        {/* Filter input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter stops by city, state, brand..."
            className="w-full sm:w-64 pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Stop</th>
              <th className="py-3 px-4">Truck Stop Station</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Retail Price</th>
              <th className="py-3 px-4">Fuel to Add</th>
              <th className="py-3 px-4">Stop Cost</th>
              <th className="py-3 px-4">Route Mile</th>
              <th className="py-3 px-4 text-right">Action</th>
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
                      ? 'bg-blue-50/70 border-l-3 border-blue-600'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Stop Index */}
                  <td className="py-3.5 px-4">
                    <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold flex items-center justify-center font-mono text-[11px]">
                      {stop.stop_index}
                    </span>
                  </td>

                  {/* Name & Address */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{stop.truck_stop.name}</span>
                      {isBestPrice && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Sparkles className="w-2.5 h-2.5" /> Best Price
                        </span>
                      )}
                    </div>
                    {stop.truck_stop.address && (
                      <div className="text-[11px] text-slate-400 mt-0.5">{stop.truck_stop.address}</div>
                    )}
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {stop.truck_stop.city}, <strong className="text-slate-800 font-semibold">{stop.truck_stop.state}</strong>
                  </td>

                  {/* Retail Price */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200">
                      ${Number(stop.truck_stop.retail_price).toFixed(3)}
                    </span>
                  </td>

                  {/* Gallons Added */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                    {stop.gallons_to_fill.toFixed(1)} gal
                  </td>

                  {/* Cost */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    ${stop.cost.toFixed(2)}
                  </td>

                  {/* Distance along route */}
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {Math.round(stop.distance_along_route_miles)} mi
                  </td>

                  {/* Map Pin Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStop && onSelectStop(stop);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-600 text-slate-600 hover:text-white transition-colors text-[11px] font-semibold border border-slate-200"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Focus</span>
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
