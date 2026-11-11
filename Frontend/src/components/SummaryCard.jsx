import React from 'react';
import { DollarSign, Route, Fuel, Clock, MapPin, Gauge } from 'lucide-react';

export default function SummaryCard({ summary }) {
  if (!summary) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 transition-all">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Gauge className="w-5 h-5 text-blue-600" />
          Trip Performance & Fuel Summary
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
          Optimized & Ready
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Cost - Prominently Highlighted */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Fuel Cost</span>
            <span className="p-1.5 bg-emerald-100 rounded-lg">
              <DollarSign className="w-4 h-4 text-emerald-700" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-800">
              ${summary.total_fuel_cost.toFixed(2)}
            </span>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">at 10 MPG</div>
          </div>
        </div>

        {/* Total Distance */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Distance</span>
            <span className="p-1.5 bg-white border border-slate-200 rounded-lg">
              <Route className="w-4 h-4 text-blue-600" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">
              {summary.total_distance_miles.toLocaleString()}
            </span>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">total miles</div>
          </div>
        </div>

        {/* Optimal Fuel Stops */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Fuel Stops</span>
            <span className="p-1.5 bg-white border border-slate-200 rounded-lg">
              <MapPin className="w-4 h-4 text-amber-500" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">
              {summary.total_fuel_stops}
            </span>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">scheduled stops</div>
          </div>
        </div>

        {/* Total Gallons */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Fuel Volume</span>
            <span className="p-1.5 bg-white border border-slate-200 rounded-lg">
              <Fuel className="w-4 h-4 text-purple-600" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">
              {summary.total_gallons_consumed.toFixed(1)}
            </span>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">gallons consumed</div>
          </div>
        </div>

        {/* Avg Price / Gal */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Price</span>
            <span className="p-1.5 bg-white border border-slate-200 rounded-lg">
              <DollarSign className="w-4 h-4 text-cyan-600" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">
              ${summary.average_price_per_gallon ? summary.average_price_per_gallon.toFixed(3) : '0.000'}
            </span>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">per gallon</div>
          </div>
        </div>

        {/* Duration */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Est. Duration</span>
            <span className="p-1.5 bg-white border border-slate-200 rounded-lg">
              <Clock className="w-4 h-4 text-indigo-600" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">
              {summary.duration_hours.toFixed(1)}
            </span>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">driving hours</div>
          </div>
        </div>
      </div>
    </div>
  );
}
