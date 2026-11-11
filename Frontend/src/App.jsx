import React, { useState } from 'react';
import axios from 'axios';
import RouteForm from './components/RouteForm';
import SummaryCard from './components/SummaryCard';
import RouteMap from './components/RouteMap';
import FuelStopsList from './components/FuelStopsList';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [planResult, setPlanResult] = useState(null);

  const handlePlanRoute = async (start, finish) => {
    setLoading(true);
    setError(null);
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
        setError('Failed to reach backend server. Please verify Django backend is running at http://localhost:8000.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <h1>FuelRoute Optimizer</h1>
          <p>Cost-Effective Fuel Stop Planning for Long-Haul Trucking across USA</p>
        </div>
      </header>

      <main className="main-content">
        <RouteForm onSubmit={handlePlanRoute} loading={loading} />

        {error && (
          <div className="alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {planResult && (
          <>
            <SummaryCard summary={planResult.summary} />
            <RouteMap route={planResult.route} stops={planResult.optimal_fuel_stops} />
            <FuelStopsList stops={planResult.optimal_fuel_stops} />
          </>
        )}
      </main>

      <footer className="footer">
        <p>Built for Spotter Django Assessment &bull; Django 6.1 + React + Leaflet &bull; OpenRouteService</p>
      </footer>
    </div>
  );
}

