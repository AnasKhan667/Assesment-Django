import React from 'react';

export default function FuelStopsList({ stops }) {
  if (!stops || stops.length === 0) {
    return (
      <div className="card stops-card empty">
        <h3>Optimal Fuel Stops</h3>
        <p>No refueling stops needed! The destination is within single-tank vehicle range (&le; 500 miles).</p>
      </div>
    );
  }

  return (
    <div className="card stops-card">
      <div className="card-header">
        <h3>Optimal Fuel Stops ({stops.length})</h3>
        <span className="badge">Sorted Chronologically</span>
      </div>

      <div className="stops-table-container">
        <table className="stops-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Truck Stop / Station</th>
              <th>Location</th>
              <th>Price / Gal</th>
              <th>Gallons Added</th>
              <th>Stop Cost</th>
              <th>Route Mile</th>
            </tr>
          </thead>
          <tbody>
            {stops.map((stop) => (
              <tr key={stop.stop_index}>
                <td className="stop-index">{stop.stop_index}</td>
                <td>
                  <strong>{stop.truck_stop.name}</strong>
                  <div className="sub-text">{stop.truck_stop.address}</div>
                </td>
                <td>
                  {stop.truck_stop.city}, {stop.truck_stop.state}
                </td>
                <td className="price-tag">
                  ${Number(stop.truck_stop.retail_price).toFixed(3)}
                </td>
                <td>{stop.gallons_to_fill.toFixed(1)} gal</td>
                <td className="cost-tag">${stop.cost.toFixed(2)}</td>
                <td>{Math.round(stop.distance_along_route_miles)} mi</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

