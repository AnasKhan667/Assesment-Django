import React, { useState } from 'react';
import { MapPin, Flag, ArrowUpDown, Sparkles, Navigation, Info, Fuel, Gauge, Sliders } from 'lucide-react';

const PRESETS = [
  { label: 'NYC → Los Angeles', dist: '~2,815 mi', start: 'New York, NY', finish: 'Los Angeles, CA' },
  { label: 'Chicago → Miami', dist: '~1,380 mi', start: 'Chicago, IL', finish: 'Miami, FL' },
  { label: 'Seattle → Boston', dist: '~3,020 mi', start: 'Seattle, WA', finish: 'Boston, MA' },
  { label: 'NYC → Philadelphia', dist: '104 mi (0 stops)', start: 'New York, NY', finish: 'Philadelphia, PA' },
];

export default function RouteForm({ onSubmit, loading }) {
  const [start, setStart] = useState('New York, NY');
  const [finish, setFinish] = useState('Los Angeles, CA');
  const [showConfig, setShowConfig] = useState(false);

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
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-5 md:p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Route Dispatch Planner</h2>
            <p className="text-xs text-slate-400">Define origin and destination coordinates across continental US</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          <span>{showConfig ? 'Hide Specs' : 'Fleet Specs'}</span>
        </button>
      </div>

      {/* Fleet Specs Dropdown */}
      {showConfig && (
        <div className="my-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2 text-slate-300">
          <div className="flex items-center justify-between font-semibold text-slate-200 pb-1 border-b border-slate-800">
            <span>Assessment Model Specifications</span>
            <span className="text-[10px] text-blue-400 font-mono">FIXED CONSTRAINTS</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-slate-400">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Vehicle Range</span>
              <strong className="text-slate-200 font-mono text-xs">500.0 Miles</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Fuel Economy</span>
              <strong className="text-slate-200 font-mono text-xs">10.0 MPG</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Starting Tank</span>
              <strong className="text-emerald-400 font-mono text-xs">100% (50.0 gal)</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Corridor Radius</span>
              <strong className="text-slate-200 font-mono text-xs">50.0 Mi Lateral</strong>
            </div>
          </div>
        </div>
      )}

      {/* Inputs Form */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              Origin (US City / State)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                placeholder="e.g. New York, NY"
                required
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-sm font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Swap Button (Centered between inputs on desktop) */}
          <div className="hidden md:flex absolute left-1/2 top-[34px] -translate-x-1/2 z-10">
            <button
              type="button"
              onClick={handleSwap}
              disabled={loading}
              className="p-2 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-md"
              title="Swap Origin and Destination"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Finish */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
              Destination (US City / State)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-400">
                <Flag className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={finish}
                onChange={(e) => setFinish(e.target.value)}
                placeholder="e.g. Los Angeles, CA"
                required
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-sm font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Presets:
            </span>
            {PRESETS.map((p, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => handleSelectPreset(p)}
                disabled={loading}
                className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                  start === p.start && finish === p.finish
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold shadow-xs'
                    : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{p.label}</span>
                <span className="text-[10px] text-slate-500 ml-1.5 font-mono">({p.dist})</span>
              </button>
            ))}
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Optimizing Corridor...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>Calculate Optimal Route</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
