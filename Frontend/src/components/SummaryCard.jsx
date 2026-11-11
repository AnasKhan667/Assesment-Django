import React from 'react';
import { DollarSign, Route, Fuel, Clock, MapPin, Gauge, CheckCircle2, TrendingDown } from 'lucide-react';

export default function SummaryCard({ summary }) {
  if (!summary) return null;

  const isZeroStops = summary.total_fuel_stops === 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 md:p-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Route Execution & Financial Performance
            </h3>
            <p className="text-xs text-slate-500">Calculated under 500 mi range & 10 MPG vehicle constraints</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Optimal Route Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-5">
        {/* Total Cost - Prominently Highlighted */}
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/5 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Fuel Spend</span>
            <span className="p-1 bg-emerald-100/80 rounded-lg text-emerald-700">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black text-emerald-900 font-mono tracking-tight">
              ${summary.total_fuel_cost.toFixed(2)}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              <span>Lowest corridor cost</span>
            </div>
          </div>
        </div>

        {/* Distance */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Distance</span>
            <span className="p-1 bg-white border border-slate-200 rounded-lg text-blue-600">
              <Route className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {summary.total_distance_miles.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">highway miles</div>
          </div>
        </div>

        {/* Refueling Stops */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Fuel Stops</span>
            <span className="p-1 bg-white border border-slate-200 rounded-lg text-amber-500">
              <MapPin className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {summary.total_fuel_stops}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">
              {isZeroStops ? '0 stops (starts full)' : 'scheduled refueling stops'}
            </div>
          </div>
        </div>

        {/* Fuel Volume */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Fuel Volume</span>
            <span className="p-1 bg-white border border-slate-200 rounded-lg text-purple-600">
              <Fuel className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {summary.total_gallons_consumed.toFixed(1)}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">gallons at 10 MPG</div>
          </div>
        </div>

        {/* Avg Price */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Price</span>
            <span className="p-1 bg-white border border-slate-200 rounded-lg text-cyan-600">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              ${summary.average_price_per_gallon ? summary.average_price_per_gallon.toFixed(3) : '0.000'}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">per gallon</div>
          </div>
        </div>

        {/* Driving Duration */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Drive Time</span>
            <span className="p-1 bg-white border border-slate-200 rounded-lg text-indigo-600">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {summary.duration_hours.toFixed(1)}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">estimated hours</div>
          </div>
        </div>
      </div>
    </div>
  );
}
