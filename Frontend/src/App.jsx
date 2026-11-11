import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, RefreshCw, Layers } from 'lucide-react';
import Navbar from './components/Navbar';
import RouteForm from './components/RouteForm';
import SummaryCard from './components/SummaryCard';
import RouteMap from './components/RouteMap';
import FuelStopsList from './components/FuelStopsList';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [planResult, setPlanResult] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [copied, setCopied] = useState(false);

  // Auto-plan NYC -> LA on initial page load for instant demonstration
  useEffect(() => {
    handlePlanRoute('New York, NY', 'Los Angeles, CA');
  }, []);

  const handlePlanRoute = async (start, finish) => {
    setLoading(true);
    setError(null);
    setSelectedStop(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/routes/plan/`, {
        start,
        finish,
      });
      setPlanResult(response.data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to connect to the Django API service at http://localhost:8000. Please ensure the backend server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!planResult) return;
    navigator.clipboard.writeText(JSON.stringify(planResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    if (!planResult || !planResult.optimal_fuel_stops) return;
    const stops = planResult.optimal_fuel_stops;

    const headers = ['Stop Number', 'Truck Stop Name', 'Address', 'City', 'State', 'Retail Price ($/gal)', 'Gallons Added', 'Stop Cost ($)', 'Distance Along Route (mi)'];
    const rows = stops.map((s) => [
      s.stop_index,
      `"${s.truck_stop.name.replace(/"/g, '""')}"`,
      `"${(s.truck_stop.address || '').replace(/"/g, '""')}"`,
      `"${s.truck_stop.city}"`,
      `"${s.truck_stop.state}"`,
      s.truck_stop.retail_price,
      s.gallons_to_fill,
      s.cost,
      s.distance_along_route_miles,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fuel_dispatch_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        planResult={planResult}
        onCopyJson={handleCopyJson}
        copied={copied}
        onExportCsv={handleExportCsv}
      />

      {/* Main Content Dashboard */}
      <main className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Route Input Form */}
        <RouteForm onSubmit={handlePlanRoute} loading={loading} />

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-4 text-rose-300 flex items-start gap-3 shadow-lg shadow-rose-950/30">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="font-bold text-rose-200">Routing Exception:</strong> {error}
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !planResult && (
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-12 text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white">Analyzing US Highway Fuel Corridor...</h4>
            <p className="text-xs text-slate-400 mt-1">
              Geocoding endpoints &bull; Projecting 8,000+ candidate truck stops &bull; Running look-ahead cost optimizer
            </p>
          </div>
        )}

        {/* Dashboard Results */}
        {planResult && (
          <div className="space-y-6">
            <SummaryCard summary={planResult.summary} />

            {/* Split Grid: Map & Stops */}
            <div className="space-y-6">
              <RouteMap
                route={planResult.route}
                stops={planResult.optimal_fuel_stops}
                selectedStop={selectedStop}
                onSelectStop={(stop) => setSelectedStop(stop)}
              />

              <FuelStopsList
                stops={planResult.optimal_fuel_stops}
                selectedStop={selectedStop}
                onSelectStop={(stop) => setSelectedStop(stop)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Production Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-5 text-xs text-slate-500">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">FuelRoute Enterprise Platform</span>
            <span>&bull; Spotter Assessment Candidate Muhammad</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
            <span>Django 6.1.3</span>
            <span>&bull;</span>
            <span>DRF 3.18</span>
            <span>&bull;</span>
            <span>Leaflet + React 19</span>
            <span>&bull;</span>
            <span>OpenRouteService</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
