import React, { useState } from 'react';

const PRESETS = [
  { label: 'NYC -> Los Angeles, CA', start: 'New York, NY', finish: 'Los Angeles, CA' },
  { label: 'Chicago, IL -> Miami, FL', start: 'Chicago, IL', finish: 'Miami, FL' },
  { label: 'Seattle, WA -> Boston, MA', start: 'Seattle, WA', finish: 'Boston, MA' },
  { label: 'Dallas, TX -> Atlanta, GA', start: 'Dallas, TX', finish: 'Atlanta, GA' },
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
    <div className="card route-form-card">
      <h2>Plan Your Fuel-Optimal Route</h2>
      <p className="subtitle">
        Calculates optimal truck stops (500 mi vehicle range, 10 MPG, starts full tank).
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="startInput">Start Location (USA)</label>
          <input
            id="startInput"
            type="text"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            placeholder="e.g. New York, NY or Austin, TX"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="finishInput">Finish Location (USA)</label>
          <input
            id="finishInput"
            type="text"
            value={finish}
            onChange={(e) => setFinish(e.target.value)}
            placeholder="e.g. Los Angeles, CA or Seattle, WA"
            required
            disabled={loading}
          />
        </div>

        <div className="preset-buttons">
          <span className="preset-label">Quick Presets:</span>
          {PRESETS.map((p, idx) => (
            <button
              type="button"
              key={idx}
              className="btn-preset"
              onClick={() => handleSelectPreset(p)}
              disabled={loading}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Optimizing Route...' : 'Calculate Optimal Fuel Route'}
        </button>
      </form>
    </div>
  );
}

