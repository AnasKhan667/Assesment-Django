import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, RefreshCw } from 'lucide-react';
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
        setError('Failed to reach backend API at http://localhost:8000. Please ensure Django backend is running.');
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        planResult={planResult}
        onCopyJson={handleCopyJson}
        copied={copied}
        onExportCsv={handleExportCsv}
      />

      {/* Main Container */}
      <main className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Route Input Form */}
        <RouteForm onSubmit={handlePlanRoute} loading={loading} />

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="font-bold">Routing Notice:</strong> {error}
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && !planResult && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800">Calculating Highway Corridor & Fuel Optimization...</h4>
            <p className="text-xs text-slate-500 mt-1">
              Geocoding endpoints &bull; Projecting candidate stations &bull; Running look-ahead cost-minimizer
            </p>
          </div>
        )}

        {/* Dynamic Results */}
        {planResult && (
          <div className="space-y-6">
            <SummaryCard summary={planResult.summary} />

            {/* Side-by-Side Flex Layout: Map (Left 50%) + Refuel Schedule (Right 50%) */}
            <div className="flex flex-col lg:flex-row items-stretch gap-6">
              <div className="w-full lg:w-1/2 flex flex-col min-h-[580px]">
                <RouteMap
                  route={planResult.route}
                  stops={planResult.optimal_fuel_stops}
                  selectedStop={selectedStop}
                  onSelectStop={(stop) => setSelectedStop(stop)}
                />
              </div>

              <div className="w-full lg:w-1/2 flex flex-col min-h-[580px]">
                <FuelStopsList
                  stops={planResult.optimal_fuel_stops}
                  selectedStop={selectedStop}
                  onSelectStop={(stop) => setSelectedStop(stop)}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500 mt-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FuelRoute Fleet Platform &bull; Spotter Assessment Candidate Muhammad</span>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>Django 6.1</span>
            <span>&bull;</span>
            <span>DRF 3.18</span>
            <span>&bull;</span>
            <span>OpenStreetMap</span>
            <span>&bull;</span>
            <span>Leaflet</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
