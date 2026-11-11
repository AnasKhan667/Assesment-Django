import React from 'react';
import { DollarSign, Route, Fuel, Clock, MapPin, Gauge, TrendingDown, CheckCircle2 } from 'lucide-react';

export default function SummaryCard({ summary }) {
  if (!summary) return null;

  const isZeroStops = summary.total_fuel_stops === 0;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-5 md:p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Dispatch Execution & Financial Summary
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Optimal Route Verified
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-5">
        {/* Total Cost - Prominent Emerald Card */}
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between shadow-lg shadow-emerald-950/20">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Fuel Cost</span>
            <span className="p-1.5 bg-emerald-500/20 rounded-lg">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-black text-emerald-300 font-mono tracking-tight">
              ${summary.total_fuel_cost.toFixed(2)}
            </div>
            <div className="text-[10px] text-emerald-400/80 font-medium mt-1 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              <span>Cost-optimized look-ahead</span>
            </div>
          </div>
        </div>

        {/* Distance */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Route Distance</span>
            <span className="p-1.5 bg-slate-800/80 rounded-lg text-blue-400">
              <Route className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              {summary.total_distance_miles.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">
              total highway miles
            </div>
          </div>
        </div>

        {/* Optimal Fuel Stops */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Fuel Stops</span>
            <span className="p-1.5 bg-slate-800/80 rounded-lg text-amber-400">
              <MapPin className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              {summary.total_fuel_stops}
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">
              {isZeroStops ? 'Direct trip (starts full)' : 'scheduled refueling stops'}
            </div>
          </div>
        </div>

        {/* Total Gallons */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Fuel Volume</span>
            <span className="p-1.5 bg-slate-800/80 rounded-lg text-purple-400">
              <Fuel className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              {summary.total_gallons_consumed.toFixed(1)}
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">
              gallons consumed (10 MPG)
            </div>
          </div>
        </div>

        {/* Avg Price */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Fuel Price</span>
            <span className="p-1.5 bg-slate-800/80 rounded-lg text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              ${summary.average_price_per_gallon ? summary.average_price_per_gallon.toFixed(3) : '0.000'}
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">
              effective per gallon
            </div>
          </div>
        </div>

        {/* Duration */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Est. Duration</span>
            <span className="p-1.5 bg-slate-800/80 rounded-lg text-indigo-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              {summary.duration_hours.toFixed(1)}
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">
              hours highway driving
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
