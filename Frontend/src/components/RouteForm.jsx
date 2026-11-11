import React, { useState } from 'react';
import { ArrowUpDown, Sparkles, Navigation, Info, Fuel, Gauge, SlidersHorizontal, MapPin, Flag } from 'lucide-react';

const PRESETS = [
  { label: 'NYC → Los Angeles', dist: '2,815 mi', start: 'New York, NY', finish: 'Los Angeles, CA' },
  { label: 'Chicago → Miami', dist: '1,380 mi', start: 'Chicago, IL', finish: 'Miami, FL' },
  { label: 'Seattle → Boston', dist: '3,020 mi', start: 'Seattle, WA', finish: 'Boston, MA' },
  { label: 'NYC → Philadelphia', dist: '104 mi (0 stops)', start: 'New York, NY', finish: 'Philadelphia, PA' },
];

export default function RouteForm({ onSubmit, loading }) {
  const [start, setStart] = useState('New York, NY');
  const [finish, setFinish] = useState('Los Angeles, CA');
  const [showSpecs, setShowSpecs] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (start.trim() && finish.trim()) {
      onSubmit(start.trim(), finish.trim());
    }
  };

  const handleSwap = () => {
    setStart(finish);
    setFinish(start);
  };

  const handleSelectPreset = (p) => {
    setStart(p.start);
    setFinish(p.finish);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 md:p-6 transition-all">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Route Dispatch Setup</h2>
            <p className="text-xs text-slate-500">Plan cost-optimal fuel stops across US highways</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSpecs(!showSpecs)}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
          <span>{showSpecs ? 'Hide Parameters' : 'Fleet Parameters'}</span>
        </button>
      </div>

      {/* Fleet Parameters Drawer */}
      {showSpecs && (
        <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between font-semibold text-slate-800 pb-1.5 border-b border-slate-200">
            <span>Assessment Model Parameters</span>
            <span className="text-[10px] text-blue-600 font-mono font-bold">ENFORCED CONSTRAINTS</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Max Range</span>
              <strong className="text-slate-800 font-mono">500.0 Miles</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Efficiency</span>
              <strong className="text-slate-800 font-mono">10.0 MPG</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Departure State</span>
              <strong className="text-emerald-700 font-mono">100% Full Tank</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Corridor Detour</span>
              <strong className="text-slate-800 font-mono">50.0 Mi Radius</strong>
            </div>
          </div>
        </div>
      )}

      {/* Connected Origin & Destination Inputs (Google Maps / Uber style) */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="relative bg-slate-50/80 rounded-2xl p-3 border border-slate-200/90">
          <div className="relative flex flex-col space-y-2">
            {/* Origin Input */}
            <div className="flex items-center gap-3 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-2xs focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 ring-4 ring-emerald-50"></span>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Origin (USA)
                </label>
                <input
                  type="text"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  placeholder="e.g. New York, NY"
                  required
                  disabled={loading}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Vertical Connector Line & Swap Button */}
            <div className="relative h-2 flex items-center justify-center">
              <div className="absolute left-[21px] top-[-8px] bottom-[-8px] w-0.5 border-l-2 border-dashed border-slate-300"></div>
              <button
                type="button"
                onClick={handleSwap}
                disabled={loading}
                className="absolute right-4 p-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 shadow-xs transition-all z-10"
                title="Swap Origin and Destination"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Destination Input */}
            <div className="flex items-center gap-3 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-2xs focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <span className="w-3 h-3 rounded-sm bg-rose-500 shrink-0 ring-4 ring-rose-50"></span>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Destination (USA)
                </label>
                <input
                  type="text"
                  value={finish}
                  onChange={(e) => setFinish(e.target.value)}
                  placeholder="e.g. Los Angeles, CA"
                  required
                  disabled={loading}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick Presets:
          </span>
          {PRESETS.map((p, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => handleSelectPreset(p)}
              disabled={loading}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                start === p.start && finish === p.finish
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{p.label}</span>
              <span className="text-[10px] text-slate-400 ml-1.5 font-mono">({p.dist})</span>
            </button>
          ))}
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Optimizing Highway Corridor...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>Calculate Cost-Optimal Fuel Route</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
