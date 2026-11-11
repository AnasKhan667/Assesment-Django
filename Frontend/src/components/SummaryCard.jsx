import React from 'react';

export default function SummaryCard({ summary }) {
  if (!summary) return null;

  return (
    <div className="card summary-card">
      <h3>Trip & Fuel Summary</h3>
      <div className="metrics-grid">
        <div className="metric-box">
          <span className="metric-title">Total Distance</span>
          <span className="metric-value">{summary.total_distance_miles.toLocaleString()} mi</span>
        </div>
        <div className="metric-box highlight">
          <span className="metric-title">Total Fuel Cost</span>
          <span className="metric-value">${summary.total_fuel_cost.toFixed(2)}</span>
        </div>
        <div className="metric-box">
          <span className="metric-title">Fuel Stops</span>
          <span className="metric-value">{summary.total_fuel_stops} stops</span>
        </div>
        <div className="metric-box">
          <span className="metric-title">Total Gallons</span>
          <span className="metric-value">{summary.total_gallons_consumed.toFixed(1)} gal</span>
        </div>
        <div className="metric-box">
          <span className="metric-title">Avg Price / Gal</span>
          <span className="metric-value">
            ${summary.average_price_per_gallon ? summary.average_price_per_gallon.toFixed(3) : '0.000'}
          </span>
        </div>
        <div className="metric-box">
          <span className="metric-title">Est. Duration</span>
          <span className="metric-value">{summary.duration_hours.toFixed(1)} hrs</span>
        </div>
      </div>
    </div>
  );
}

