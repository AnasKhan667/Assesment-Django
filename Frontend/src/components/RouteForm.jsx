import React, { useState } from 'react';
import { MapPin, Flag, Navigation, Sparkles, Fuel, Gauge } from 'lucide-react';

const PRESETS = [
  { label: 'NYC → Los Angeles, CA', start: 'New York, NY', finish: 'Los Angeles, CA' },
  { label: 'Chicago, IL → Miami, FL', start: 'Chicago, IL', finish: 'Miami, FL' },
  { label: 'Seattle, WA → Boston, MA', start: 'Seattle, WA', finish: 'Boston, MA' },
  { label: 'Dallas, TX → Atlanta, GA', start: 'Dallas, TX', finish: 'Atlanta, GA' },
];

export default function RouteForm({ onSubmit, loading }) {
  const [start, setStart] = useState('New York, NY');
  const [finish, setFinish] = useState('Los Angeles, CA');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (start.trim() && finish.trim()) {
      onSubmit(start.trim(), finish.trim());
    }
  };

  const handleSelectPreset = (preset) => {
    setStart(preset.start);
    setFinish(preset.finish);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Navigation className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Plan Optimal Fuel Route</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Cost-minimizing greedy look-ahead algorithm across 8,000+ US fuel stations.
          </p>
        </div>

        {/* Assumptions Pill */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-200/60 self-start md:self-auto">
          <span className="flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-blue-500" /> 500 mi Range
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5 text-amber-500" /> 10 MPG
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-600 font-semibold">Starts 100% Full</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Location */}
          <div>
            <label htmlFor="startInput" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" /> Start Location (USA)
            </label>
            <div className="relative">
              <input
                id="startInput"
                type="text"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                placeholder="e.g. New York, NY"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Finish Location */}
          <div>
            <label htmlFor="finishInput" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Flag className="w-4 h-4 text-rose-600" /> Finish Location (USA)
            </label>
            <div className="relative">
              <input
                id="finishInput"
                type="text"
                value={finish}
                onChange={(e) => setFinish(e.target.value)}
                placeholder="e.g. Los Angeles, CA"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-slate-500">Quick Test Routes:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => handleSelectPreset(p)}
                disabled={loading}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  start === p.start && finish === p.finish
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating Optimal Route & Fuel Stops...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                Calculate Optimal Fuel Route
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
