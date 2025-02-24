import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Papa from 'papaparse';
import { scaleLinear } from 'd3-scale';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/UK.css';

function UK() {
  const [data, setData] = useState([]); // State for storing parsed data
  const [centres, setCentres] = useState([]); // State for storing unique assessment centres
  const [illnesses, setIllnesses] = useState([]); // State for storing unique illnesses
  const [selectedCentre, setSelectedCentre] = useState('all'); // State for selected centre
  const [selectedIllness, setSelectedIllness] = useState(''); // State for selected illness
  const [illnessRate, setIllnessRate] = useState(null); // State for the calculated illness rate

  // Bounds for the UK map
  const ukBounds = [
    [49.8, -8.0],
    [60.9, 2.0],
  ];

  // Fetch and parse the CSV data on component mount
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('./data/heart_disease_rates.csv');
      const text = await response.text();
      Papa.parse(text, {
        header: true,
        complete: (result) => {
          const parsedData = result.data.map((item) => ({
            ...item,
            latitude: parseFloat(item.latitude), // Parse latitude as a float
            longitude: parseFloat(item.longitude), // Parse longitude as a float
            illness_rate: parseFloat(item.illness_rate), // Parse illness rate as a float
          }));
          setData(parsedData); // Store parsed data in state
          setCentres(['all', ...new Set(parsedData.map((item) => item.assessment_centre))]); // Extract unique centres
          setIllnesses([...new Set(parsedData.map((item) => item.illness))]); // Extract unique illnesses
        },
      });
    };
    fetchData();
  }, []);

  // Handle centre selection change
  const handleCentreChange = (event) => {
    const centre = event.target.value;
    setSelectedCentre(centre);
    updateIllnessRate(centre, selectedIllness);
  };

  // Handle illness selection change
  const handleIllnessChange = (event) => {
    const illness = event.target.value;
    setSelectedIllness(illness);
    updateIllnessRate(selectedCentre, illness);
  };

  // Update the calculated illness rate based on selected centre and illness
  const updateIllnessRate = (centre, illness) => {
    if (centre === 'all' && illness) {
      const validEntries = data.filter(
        (item) =>
          item.illness === illness && 
          !isNaN(item.illness_rate)
      );

      if (validEntries.length === 0) {
        setIllnessRate(null);
        return;
      }

      const total = validEntries.reduce((sum, item) => sum + item.illness_rate, 0);
      setIllnessRate(total / validEntries.length);
    } else if (centre && illness) {
      const selectedData = data.find(
        (item) =>
          item.assessment_centre === centre && 
          item.illness === illness
      );
      setIllnessRate(selectedData ? selectedData.illness_rate : null);
    } else {
      setIllnessRate(null);
    }
  };

  // Define a color scale for CircleMarker based on illness rates
  const colorScale = scaleLinear()
    .domain([0, 60]) // Scale range from 0% to 60%
    .range(['#ffefd5', '#8b0000']); // Light peach to dark red

  return (
    <div className="uk-container">
      {/* Header component */}
      <Header />

      <div className="uk-content-wrapper">
        {/* Controls Section */}
        <div className="uk-controls-section">
          <div className="controls-card">
            <h2>Explore Heart Condition Rates</h2>
            <div className="dropdown-group">
              {/* Dropdown for selecting city */}
              <div className="dropdown-container">
                <label htmlFor="centre">Select City:</label>
                <select
                  id="centre"
                  className="styled-dropdown"
                  value={selectedCentre}
                  onChange={handleCentreChange}
                >
                  {centres.map((centre, index) => (
                    <option key={`${centre}-${index}`} value={centre}>
                      {centre === 'all' ? 'All Cities' : centre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown for selecting condition */}
              <div className="dropdown-container">
                <label htmlFor="illness">Select Condition:</label>
                <select
                  id="illness"
                  className="styled-dropdown"
                  value={selectedIllness}
                  onChange={handleIllnessChange}
                >
                  <option value="">Select Condition</option>
                  {illnesses.map((illness, index) => (
                    <option key={`${illness}-${index}`} value={illness}>
                      {illness}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stats Card */}
            {selectedIllness && (
              <div className="stats-card">
                <h3>
                  {selectedCentre === 'all' 
                    ? `${selectedIllness} Nationwide`
                    : `${selectedIllness} in ${selectedCentre}`}
                </h3>
                <div className="rate-display">
                  {illnessRate !== null ? (
                    <>
                      <span className="rate-value">{illnessRate.toFixed(1)}</span>
                      <span className="rate-unit">% prevalence</span>
                    </>
                  ) : selectedCentre === 'all' ? (
                    <span className="rate-na">Select a centre to view specific data</span>
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
            center={[54.5, -2.5]} // Centered over the UK
            zoom={6} // Initial zoom level
            className="leaflet-container"
            bounds={ukBounds} // Set bounds to the UK area
            maxBounds={ukBounds} // Prevent panning outside the UK bounds
            maxBoundsViscosity={1.0}
            minZoom={5} // Minimum zoom level allowed
          >
            {/* Tile layer for the map */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Map markers */}
            {data
              .filter(
                (centre) =>
                  (selectedCentre === 'all' || centre.assessment_centre === selectedCentre) &&
                  !isNaN(centre.latitude) &&
                  !isNaN(centre.longitude) &&
                  (selectedIllness === '' || centre.illness === selectedIllness)
              )
              .map((centre, index) => {
                const isSelected = centre.assessment_centre === selectedCentre;
                const illnessRate = selectedIllness ? parseFloat(centre.illness_rate) : null;

                return (
                  <CircleMarker
                    key={`${centre.assessment_centre}-${centre.illness}-${index}`}
                    center={[centre.latitude, centre.longitude]}
                    radius={isSelected ? 12 : 8}
                    fillColor={
                      selectedIllness
                        ? colorScale(illnessRate || 0)
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
                      <h4>{centre.assessment_centre}</h4>
                      {selectedIllness && (
                        <div className="popup-content">
                          <div className="popup-rate">
                            {illnessRate?.toFixed(1) || 'N/A'}%
                          </div>
                          <p>of adults report {selectedIllness.toLowerCase()}</p>
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

export default UK;
