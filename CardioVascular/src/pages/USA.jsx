import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Papa from 'papaparse'; // Library for parsing CSV files
import { scaleLinear } from 'd3-scale'; // D3 scale for color mapping
import Header from '../components/Header'; // Header component
import Footer from '../components/Footer'; // Footer component
import '../styles/USA.css'; // CSS file for styling

function USA() {
  // State variables
  const [data, setData] = useState([]); // Parsed data from the CSV file
  const [states, setStates] = useState([]); // List of unique states
  const [conditions, setConditions] = useState([]); // List of unique conditions
  const [selectedState, setSelectedState] = useState('all'); // Selected state
  const [selectedCondition, setSelectedCondition] = useState(''); // Selected condition
  const [conditionRate, setConditionRate] = useState(null); // Calculated condition rate

  // Bounds for the USA map
  const usaBounds = [
    [24.396308, -125.000000], // Southwest corner of the USA
    [49.384358, -66.934570], // Northeast corner of the USA
  ];

  // Fetch and parse CSV data on component mount
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('./data/heart_conditions_by_state_with_coordinates.csv');
      const text = await response.text();
      Papa.parse(text, {
        header: true,
        complete: (result) => {
          const parsedData = result.data.map((item) => ({
            ...item,
            Latitude: parseFloat(item.Latitude), // Parse latitude as float
            Longitude: parseFloat(item.Longitude), // Parse longitude as float
          }));
          setData(parsedData); // Store parsed data in state
          setStates(['all', ...new Set(parsedData.map((item) => item.State))]); // Extract unique states
          setConditions([
            'High Blood Pressure',
            'Heart Attack',
            'Coronary Heart Disease',
            'Stroke',
            'High Cholesterol',
            'Heart Disease (MI or CHD)',
          ]); // List of conditions
        },
      });
    };
    fetchData();
  }, []);

  // Handle state selection change
  const handleStateChange = (event) => {
    const state = event.target.value;
    setSelectedState(state);
    updateConditionRate(state, selectedCondition);
  };

  // Handle condition selection change
  const handleConditionChange = (event) => {
    const condition = event.target.value;
    setSelectedCondition(condition);
    updateConditionRate(selectedState, condition);
  };

  // Update condition rate based on selected state and condition
  const updateConditionRate = (state, condition) => {
    if (state === 'all' && condition) {
      const validEntries = data.filter((item) => !isNaN(parseFloat(item[condition])));
      if (validEntries.length === 0) {
        setConditionRate(null);
        return;
      }
      const total = validEntries.reduce((sum, item) => sum + parseFloat(item[condition]), 0);
      setConditionRate(total / validEntries.length);
    } else if (state && condition) {
      const selectedData = data.find((item) => item.State === state);
      setConditionRate(selectedData ? parseFloat(selectedData[condition]) : null);
    } else {
      setConditionRate(null);
    }
  };

  // Define a color scale for CircleMarker based on illness rates
  const colorScale = scaleLinear()
    .domain([0, 60]) // Scale range from 0% to 60%
    .range(['#ffefd5', '#8b0000']); // Light peach to dark red

  return (
    <div className="usa-container">
      {/* Header component */}
      <Header />

      <div className="usa-content-wrapper">
        {/* Controls Section */}
        <div className="usa-controls-section">
          <div className="controls-card">
            <h2>Explore Heart Condition Rates</h2>
            <div className="dropdown-group">
              {/* Dropdown for selecting state */}
              <div className="dropdown-container">
                <label htmlFor="state">Select State:</label>
                <select
                  id="state"
                  className="styled-dropdown"
                  value={selectedState}
                  onChange={handleStateChange}
                >
                  {states.map((state, index) => (
                    <option key={`${state}-${index}`} value={state}>
                      {state === 'all' ? 'All States' : state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown for selecting condition */}
              <div className="dropdown-container">
                <label htmlFor="condition">Select Condition:</label>
                <select
                  id="condition"
                  className="styled-dropdown"
                  value={selectedCondition}
                  onChange={handleConditionChange}
                >
                  <option value="">Select Condition</option>
                  {conditions.map((condition, index) => (
                    <option key={`${condition}-${index}`} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stats Card */}
            {selectedCondition && (
              <div className="stats-card">
                <h3>
                  {selectedState === 'all'
                    ? `${selectedCondition} Nationwide`
                    : `${selectedCondition} in ${selectedState}`}
                </h3>
                <div className="rate-display">
                  {conditionRate !== null ? (
                    <>
                      <span className="rate-value">{conditionRate.toFixed(1)}</span>
                      <span className="rate-unit">% prevalence</span>
                    </>
                  ) : (
                    <span className="rate-na">Data not available</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map Section */}
        <div className="map-section">
          <MapContainer
            center={[39.8283, -98.5795]} // Centered over the USA
            zoom={4} // Initial zoom level
            className="leaflet-container"
            bounds={usaBounds} // Set bounds to the USA area
            maxBounds={usaBounds} // Prevent panning outside the USA bounds
            maxBoundsViscosity={1.0}
            minZoom={3} // Minimum zoom level allowed
          >
            {/* Tile layer for the map */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Map markers */}
            {data
              .filter(
                (state) =>
                  (selectedState === 'all' || state.State === selectedState) &&
                  !isNaN(state.Latitude) &&
                  !isNaN(state.Longitude)
              )
              .map((state, index) => {
                const conditionRate = selectedCondition ? parseFloat(state[selectedCondition]) : null;
                const isSelected = state.State === selectedState;

                return (
                  <CircleMarker
                    key={`${state.State}-${index}`}
                    center={[state.Latitude, state.Longitude]}
                    radius={isSelected ? 12 : 8}
                    fillColor={
                      selectedCondition
                        ? colorScale(conditionRate || 0)
                        : isSelected
                        ? '#ff4444'
                        : '#4a90e2'
                    }
                    color="#333"
                    weight={isSelected ? 2 : 1}
                    opacity={0.8}
                    fillOpacity={0.9}
                  >
                    {/* Popup for marker */}
                    <Popup className="map-popup">
                      <h4>{state.State}</h4>
                      {selectedCondition && (
                        <div className="popup-content">
                          <div className="popup-rate">
                            {conditionRate?.toFixed(1) || 'N/A'}%
                          </div>
                          <p>of adults report {selectedCondition.toLowerCase()}</p>
                        </div>
                      )}
                    </Popup>
                  </CircleMarker>
                );
              })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default USA;
