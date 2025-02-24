import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import '../styles/UKDropdown.css'; 

const HeartIllnessRates = ({ setSelectedCentre, setSelectedIllness, setIllnessRate, illnessRate }) => {
  const [data, setData] = useState([]);
  const [centres, setCentres] = useState([]);
  const [illnesses, setIllnesses] = useState([]);
  const [localSelectedCentre, setLocalSelectedCentre] = useState('');
  const [localSelectedIllness, setLocalSelectedIllness] = useState('');
  const [showAllCenters, setShowAllCenters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('./data/heart_disease_with_coords.csv');
      const text = await response.text();
      Papa.parse(text, {
        header: true,
        complete: (result) => {
          const parsedData = result.data;
          setData(parsedData);
          setCentres([...new Set(parsedData.map(item => item.assessment_centre))]);
          setIllnesses([...new Set(parsedData.map(item => item.illness))]);
        }
      });
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (localSelectedIllness) {
      if (showAllCenters) {
        setIllnessRate(null);
      } else if (localSelectedCentre) {
        const selectedData = data.find(
          item =>
            item.assessment_centre === localSelectedCentre &&
            item.illness === localSelectedIllness
        );
        const rate = selectedData ? selectedData.illness_rate : null;
        setIllnessRate(rate);
      }
    }
    setSelectedCentre(localSelectedCentre);
    setSelectedIllness(localSelectedIllness);
  }, [localSelectedCentre, localSelectedIllness, showAllCenters, data, setSelectedCentre, setSelectedIllness, setIllnessRate]);

  const handleCentreChange = (event) => {
    const centre = event.target.value;
    setLocalSelectedCentre(centre);
    setSelectedCentre(centre);
    setShowAllCenters(centre === 'all');
  };

  const handleIllnessChange = (event) => {
    const illness = event.target.value;
    setLocalSelectedIllness(illness);
  };

  return (
    <div className="heart-illness-rates">
      <h1 className="title">UK- Cardio Vascular Rates by City</h1>
      <div className="dropdown-container">
        <label htmlFor="centre" className="label">City: </label>
        <select
          id="centre"
          className="dropdown"
          value={localSelectedCentre}
          onChange={handleCentreChange}
        >
          <option value="">Select a city</option>
          <option value="all">All Centers</option>
          {centres.map((centre, index) => (
            <option key={`${centre}-${index}`} value={centre}>{centre}</option>
          ))}
        </select>
      </div>
      <div className="dropdown-container">
        <label htmlFor="illness" className="label">Illness: </label>
        <select
          id="illness"
          className="dropdown"
          value={localSelectedIllness}
          onChange={handleIllnessChange}
        >
          <option value="">Select an illness</option>
          {illnesses.map((illness, index) => (
            <option key={`${illness}-${index}`} value={illness}>{illness}</option>
          ))}
        </select>
      </div>
      {localSelectedIllness && (
        <div className="illness-rates">
          {showAllCenters ? (
            <div>
              <h3>Rates for {localSelectedIllness} across all centers:</h3>
              <ul>
                {data
                  .filter(item => item.illness === localSelectedIllness)
                  .map((item, index) => (
                    <li key={index}>
                      {item.assessment_centre}: {item.illness_rate}%
                    </li>
                  ))
                }
              </ul>
            </div>
          ) : (
            localSelectedCentre && (
              <div className="illness-rate">
                The cardiovascular disease rate in {localSelectedCentre} for {localSelectedIllness} is <span>{illnessRate || 'N/A'}%</span>.
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default HeartIllnessRates;
