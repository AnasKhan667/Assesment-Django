import React from 'react';
import { Fuel, CheckCircle2, DollarSign, MapPin } from 'lucide-react';

export default function FuelStopsList({ stops }) {
  if (!stops || stops.length === 0) {
    return (
      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-6 text-center">
        <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-700 mb-2">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-emerald-900">Direct Route — Zero Fuel Stops Required</h4>
        <p className="text-sm text-emerald-700 max-w-lg mx-auto mt-1">
          This trip fits entirely within the vehicle's single-tank range (&le; 500 miles). Since the vehicle departs with a full tank, total additional fuel cost is <strong>$0.00</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden transition-all">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Fuel className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-900">
            Cost-Optimal Refueling Schedule ({stops.length} Stops)
          </h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
          Chronological Route Order
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
            <tr>
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Truck Stop / Brand</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Retail Price</th>
              <th className="py-3 px-4">Gallons to Fill</th>
              <th className="py-3 px-4">Stop Cost</th>
              <th className="py-3 px-4">Route Mile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stops.map((stop) => (
              <tr key={stop.stop_index} className="hover:bg-slate-50/80 transition-colors">
                {/* Index badge */}
                <td className="py-3.5 px-4">
                  <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">
                    {stop.stop_index}
                  </span>
                </td>

                {/* Truck Stop Name & Address */}
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900">{stop.truck_stop.name}</div>
                  {stop.truck_stop.address && (
                    <div className="text-xs text-slate-400 mt-0.5">{stop.truck_stop.address}</div>
                  )}
                </td>

                {/* City & State */}
                <td className="py-3.5 px-4 font-medium text-slate-600">
                  {stop.truck_stop.city}, {stop.truck_stop.state}
                </td>

                {/* Price */}
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ${Number(stop.truck_stop.retail_price).toFixed(3)}/gal
                  </span>
                </td>

                {/* Gallons */}
                <td className="py-3.5 px-4 font-semibold text-slate-800">
                  {stop.gallons_to_fill.toFixed(1)} gal
                </td>

                {/* Stop Cost */}
                <td className="py-3.5 px-4">
                  <span className="font-bold text-slate-900 text-sm">
                    ${stop.cost.toFixed(2)}
                  </span>
                </td>

                {/* Distance along route */}
                <td className="py-3.5 px-4 text-xs font-semibold text-slate-500">
                  {Math.round(stop.distance_along_route_miles)} mi
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
