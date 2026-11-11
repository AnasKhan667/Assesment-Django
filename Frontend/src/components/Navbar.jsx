import React from 'react';
import { Truck, Fuel, Gauge, Download, Copy, Check, ExternalLink } from 'lucide-react';

export default function Navbar({ planResult, onCopyJson, copied, onExportCsv }) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">FuelRoute</span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                Spotter Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              US Long-Haul Fleet Fuel Optimization Engine
            </p>
          </div>
        </div>

        {/* System Status & Constraints Badges */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400 font-medium">Django API:</span>
            <span className="font-mono text-emerald-400 font-semibold">:8000 Live</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-400 font-mono">
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
            <span>Range: 500mi</span>
            <span className="text-slate-600">•</span>
            <Fuel className="w-3.5 h-3.5 text-amber-400" />
            <span>10 MPG</span>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          {planResult && (
            <>
              {/* Copy Raw JSON */}
              <button
                type="button"
                onClick={onCopyJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-xs"
                title="Copy API response JSON"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span className="hidden sm:inline">{copied ? 'JSON Copied!' : 'Copy API JSON'}</span>
              </button>

              {/* Export CSV Dispatch Sheet */}
              <button
                type="button"
                onClick={onExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 transition-colors shadow-xs"
                title="Export Dispatch Sheet CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </>
          )}

          {/* GitHub Repo */}
          <a
            href="https://github.com/AnasKhan667/Assesment-Django"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="hidden md:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
