import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Papa from 'papaparse';
import { scaleLinear } from 'd3-scale';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/UK.css';
import { Bar } from 'react-chartjs-2';

function UK() {
  const [data, setData] = useState([]);
  const [centres, setCentres] = useState([]);
  const [illnesses, setIllnesses] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState('all');
  const [selectedIllness, setSelectedIllness] = useState('');
  const [illnessRate, setIllnessRate] = useState(null);
  const [GiniCoeff, setGiniCoeff] = useState(null);
  const [chartData1, setChartData1] = useState({ datasets: [] });
  const [chartOptions1, setChartOptions1] = useState({});
  const [selectedYearData, setSelectedYearData] = useState([]);
  const [discrepancyRate, setDiscrepancyRate] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const selectedIllnessCapitalized = selectedIllness.charAt(0).toUpperCase() + selectedIllness.slice(1);
  const [minRate, setMinRate] = useState(null);
  const [maxRate, setMaxRate] = useState(null);
  const [globalMinCity, setGlobalMinCity] = useState(null);
  const [globalMaxCity, setGlobalMaxCity] = useState(null);

  const ukBounds = [
    [49.8, -8.0],
    [60.9, 2.0],
  ];

  const existingMinTooltip = document.getElementById("min-tooltip");
  if (existingMinTooltip) {
    existingMinTooltip.remove();
  }

  const existingMaxTooltip = document.getElementById("max-tooltip");
  if (existingMaxTooltip) {
    existingMaxTooltip.remove();
  }

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('./data/heart_disease_rates.csv');
      const text = await response.text();
      Papa.parse(text, {
        header: true,
        complete: (result) => {
          const parsedData = result.data.map((item) => ({
            ...item,
            latitude: parseFloat(item.latitude),
            longitude: parseFloat(item.longitude),
            illness_rate: parseFloat(item.illness_rate),
          }));
          setData(parsedData);
          // Get unique centres while preserving order
          const uniqueCentres = [...new Set(parsedData.map(item => item.assessment_centre))].filter(item => item !== "");
          setCentres(['all', ...uniqueCentres]);
          const uniqueIllnesses = [...new Set(parsedData.map((item) => item.illness))].filter(item => item !== undefined);
          //(uniqueIllnesses);
          setIllnesses(uniqueIllnesses);
        },
      });
    };
    fetchData();
  }, []);


  useEffect(() => {
    // This effect will run whenever selectedCentre changes
    // You can add any additional logic here if needed
  }, [selectedCentre]);


  // Retrieve income data
  const csvFile = selectedCentre === "all" ? require('../income_CSV/all.csv') : require('../income_CSV/giniandprev.csv');
  // Using Papa Parse to parse the CSV file
  if (selectedCentre === "all") {
    Papa.parse(csvFile, {
      download: true,  // Downloads the CSV file
      header: true,  // Treats the first row as the header
      dynamicTyping: true,  // Converts numeric strings to actual numbers
      complete: (result) => {  // This function is called when parsing is done
        // Check for any parsing errors and log them
        if (result.errors.length > 0) {
          console.error("Parsing errors:", result.errors);
          return;
        }

        // Log data to confirm it's parsed correctly
        //console.log("Parsed Data:", result.data);

        //Delete stroke from options (no data available for all UK)
        // setIllnesses(prevIllnesses => {
        //   if (!prevIllnesses.includes("stroke")) return prevIllnesses;
        //   return prevIllnesses.filter(illness => illness !== "stroke");
        // });
        setIllnesses(prevIllnesses => {
          if (prevIllnesses.includes("stroke")) return prevIllnesses;
          const newIllness = "stroke";
          const indexToInsert = prevIllnesses.length > 0 ? prevIllnesses.length - 1 : 0;
          const updatedIllnesses = [...prevIllnesses].filter(item => item !== undefined);
          updatedIllnesses.splice(indexToInsert, 0, newIllness);
          return updatedIllnesses;
        });

        // Extract income data from the CSV and filter out empty values
        //console.log(selectedIllness);
        const incomes = result.data.filter(item => item[' "Illness"'].trim() === selectedIllness).map(item => item[' "Income"']).filter(Boolean);

        // Extract percentage data from the CSV and filter out empty values
        const percentages = result.data.filter(item => item[' "Illness"'].trim() === selectedIllness).map(item => item[' "Percent"']).filter(Boolean);

        // Normalize and clean up the data
        const cleanedData = result.data.filter(item => item[' "Illness"'].trim() === selectedIllness)
          .map(item => ({
            Income: item[' "Income"']?.toString(),
            Percent: parseFloat(item[' "Percent"']?.toString().trim())
          }));

        setSelectedYearData(cleanedData); // Store the cleaned data in the state
        const gini = (selectedIllness === "angina") ? 0.3 : 0.35;
        setGiniCoeff(gini);

        const discRate1 = cleanedData
          .filter(item => item.Income.trim() === "<18000")
          .map(item => item.Percent); // Get an array of values

        const discRate2 = cleanedData
          .filter(item => item.Income.trim() === ">100000")
          .map(item => item.Percent); // Get an array of values

        // Extract first value from arrays safely
        const rate1 = discRate1.length > 0 ? discRate1[0] : NaN;
        const rate2 = discRate2.length > 0 ? discRate2[0] : NaN;

        // Validate and calculate discrepancy rate
        if (!isNaN(rate1) && !isNaN(rate2) && rate2 !== 0) {
          setDiscrepancyRate(parseFloat(rate1) / parseFloat(rate2));
        } else {
          setDiscrepancyRate(NaN);
          //console.error("Invalid data: Cannot calculate discrepancy rate.");
        }


        // Update the chart data with parsed years and percentages
        setChartData1({
          labels: incomes,  // Labels on the X-axis (years)
          datasets: [
            {
              label: "United Kingdom",  // Label of the dataset (country name)
              data: percentages,  // Data for the Y-axis (percentages)
              borderColor: "black",  // Color of the border around the bars
              backgroundColor: "#BE0000"  // Color of the bars (orange)
            }
          ]
        });

        // Set up the chart options (appearance and behavior of the chart)
        setChartOptions1({
          maintainAspectRatio: false,  // Disable maintaining the aspect ratio for responsiveness
          responsive: true,  // Make the chart responsive to the container size
          plugins: {
            legend: {
              position: "top",  // Place the legend at the top
              display: false  // Hide the legend
            },
            title: {
              display: true,  // Display the chart title
              text: "Prevalence of " + selectedIllnessCapitalized + " (%) by Income"  // Title text
            },
            tooltip: {
              callbacks: {
                title: (tooltipItems) => {
                  return "Income " + tooltipItems[0].label + ": ";
                },
                label: (tooltipItem) => {
                  return tooltipItem.raw + "%";
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Income Bracket (£ Per Year)"  // Label for X-axis
              }
            },
            y: {
              title: {
                display: true,
                text: "Prevalence of Disease (%)"  // Label for Y-axis
              }
            }
          }
        });
      }
    });
  } else {
    Papa.parse(csvFile, {
      download: true,  // Downloads the CSV file
      header: true,  // Treats the first row as the header
      dynamicTyping: true,  // Converts numeric strings to actual numbers
      complete: (result) => {  // This function is called when parsing is done
        // Check for any parsing errors and log them
        if (result.errors.length > 0) {
          console.error("Parsing errors:", result.errors);
          return;
        }

        // Log data to confirm it's parsed correctly
        //console.log("Parsed Data:", result.data);

        // Add stroke to selection options for income graph
        setIllnesses(prevIllnesses => {
          if (prevIllnesses.includes("stroke")) return prevIllnesses;
          const newIllness = "stroke";
          const indexToInsert = prevIllnesses.length > 0 ? prevIllnesses.length - 1 : 0;
          const updatedIllnesses = [...prevIllnesses].filter(item => item !== undefined);
          updatedIllnesses.splice(indexToInsert, 0, newIllness);
          return updatedIllnesses;
        });

        // Extract income data from the CSV and filter out empty values
        const incomes = Object.keys(result.data[0]).slice(4)

        // Extract percentage data from the CSV and filter out empty values
        const diseaseRow = result.data.find(row => row.cities === selectedCentre && row.conditions === selectedIllness);

        if (!diseaseRow) {
          console.error("No data found for " + selectedIllnessCapitalized);
          return;
        }
        // Extract all income class values (columns 4 to 8)
        const percentages = incomes.map(item => diseaseRow[item] * 100);

        // Normalize and clean up the data
        const cleanedData = result.data.map(item => ({
          city: item["cities"]?.toString().trim(), // Store city names
          condition: item["conditions"]?.toString().trim(), // Store medical condition
          gini: parseFloat(item["Gini"]), // Store Gini coefficient
          "<18000": parseFloat(item["<18000"]), // Convert prevalence rates to numbers
          "18-31000": parseFloat(item["18-31000"]),
          "31-52000": parseFloat(item["31-52000"]),
          "52-100000": parseFloat(item["52-100000"]),
          ">100000": parseFloat(item[">100000"])
        }));

        setSelectedYearData(cleanedData); // Store the cleaned data in the state
        setGiniCoeff(diseaseRow["Gini"]); // Store Gini coefficient in the state
        const discRate1 = parseFloat(diseaseRow['<18000']);
        const discRate2 = parseFloat(diseaseRow['>100000']);

        // Validate and calculate discrepancy rate
        if (!isNaN(discRate1) && !isNaN(discRate2) && discRate2 !== 0) {
          setDiscrepancyRate(parseFloat(discRate1) / parseFloat(discRate2));
        } else {
          setDiscrepancyRate(NaN);
          console.error("Invalid data: Cannot calculate discrepancy rate.");
        }

        // Update the chart data with parsed years and percentages
        setChartData1({
          labels: incomes,  // Labels on the X-axis (years)
          datasets: [
            {
              label: "United Kingdom",  // Label of the dataset (country name)
              data: percentages,  // Data for the Y-axis (percentages)
              borderColor: "black",  // Color of the border around the bars
              backgroundColor: "#BE0000"  // Color of the bars (orange)
            }
          ]
        });

        // Set up the chart options (appearance and behavior of the chart)
        setChartOptions1({
          maintainAspectRatio: false,  // Disable maintaining the aspect ratio for responsiveness
          responsive: true,  // Make the chart responsive to the container size
          plugins: {
            legend: {
              position: "top",  // Place the legend at the top
              display: false  // Hide the legend
            },
            title: {
              display: true,  // Display the chart title
              text: "Prevalence of " + selectedIllnessCapitalized + " (%) by Income"  // Title text
            },
            tooltip: {
              callbacks: {
                title: (tooltipItems) => {
                  return "Income " + tooltipItems[0].label + ": ";
                },
                label: (tooltipItem) => {
                  return parseFloat(tooltipItem.raw).toFixed(1) + "%"; // Truncate percent to 1 decimal place
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Income Bracket (£ Per Year)"  // Label for X-axis
              }
            },
            y: {
              title: {
                display: true,
                text: "Prevalence of Disease (%)"  // Label for Y-axis
              }
            }
          }
        });
      }
    });
  }

  // Handle centre selection change
  const handleCentreChange = (event) => {
    const centre = event.target.value;
    setSelectedCentre(centre);
    setSelectedMarker(centre);
    //console.log(centre)
    updateIllnessRate(centre, selectedIllness);
  };

  // Handle illness selection change
  const handleIllnessChange = (event) => {
    const illness = event.target.value;
    setSelectedIllness(illness);
    updateIllnessRate(selectedCentre, illness);
  };

  const handleMarkerClick = (centreName) => {
    setSelectedCentre(centreName);
    //console.log(centreName)
    setSelectedMarker(centreName);  // This is the key change
    if (selectedIllness) updateIllnessRate(centreName, selectedIllness);
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
      const minRate = Math.min(...validEntries.map(d => d.illness_rate));
      const maxRate = Math.max(...validEntries.map(d => d.illness_rate));
      setMinRate(minRate);
      setMaxRate(maxRate);
      const globalMinCity = validEntries.filter(city =>
        city.illness_rate === minRate);

      const globalMaxCity = validEntries.filter(city =>
        city.illness_rate === maxRate);

      setGlobalMinCity(globalMinCity);
      setGlobalMaxCity(globalMaxCity);

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
                  {illnesses.map((illness, index) => {
                    const capitalizedIllness =
                      typeof illness === "string" && illness.length > 0
                        ? illness.charAt(0).toUpperCase() + illness.slice(1)
                        : illness;

                    return (
                      <option key={`${illness}-${index}`} value={illness}>
                        {capitalizedIllness}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>


            {/* Stats Card */}
            {selectedIllness && (
              <div className="stats-card">
                <h3>
                  {selectedCentre === 'all'
                    ? `${selectedIllnessCapitalized} Nationwide`
                    : `${selectedIllnessCapitalized} in ${selectedCentre}`}
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

            {/* Income Graph */}
            {((selectedCentre === 'all' && (selectedIllness === "angina" || selectedIllness === "stroke")) ||
              (selectedCentre !== 'all' &&
                (selectedIllness === "angina" ||
                  selectedIllness === "stroke" ||
                  selectedIllness === "hypertension" ||
                  selectedIllness === "heart attack/myocardial infarction"))) && (
                <div className="info_graf">
                  <div style={{ height: "250px" }}>
                    <Bar options={chartOptions1} data={chartData1} />
                    <p className="p_source">Source</p>
                    <p className="p_source_text">
                      UK Biobank
                    </p>
                  </div>
                </div>
              )}
            {/* Income Discrepancy Blurb */}
            {((selectedCentre === 'all' && (selectedIllness === "angina" || selectedIllness === "stroke")) ||
              (selectedCentre !== 'all' &&
                (selectedIllness === "angina" ||
                  selectedIllness === "stroke" ||
                  selectedIllness === "hypertension" ||
                  selectedIllness === "heart attack/myocardial infarction"))) && (<div className="stats-card">
                    <div className="rate-display">
                      {discrepancyRate !== null && selectedIllness ? (
                        <>
                          <p>{selectedCentre === 'all'
                            ? `In the United Kingdom, people of the lowest income class are `
                            : `In ${selectedCentre}, people of the lowest income class are `}<span className="rate-value">{discrepancyRate.toFixed(1)}</span> times more likely to be diagnosed with {selectedIllness.toLowerCase()} than the highest income class.</p>
                        </>
                      ) : (
                        <span className="rate-na">Data not available</span>
                      )}
                    </div>
                  </div>)}
            {/* Gini Coefficient */}
            {((selectedCentre === 'all' && (selectedIllness === "angina" || selectedIllness === "stroke")) ||
              (selectedCentre !== 'all' &&
                (selectedIllness === "angina" ||
                  selectedIllness === "stroke" ||
                  selectedIllness === "hypertension" ||
                  selectedIllness === "heart attack/myocardial infarction"))) && (
                <div className="stats-card">
                  <h3>
                    {selectedCentre === 'all'
                      ? `United Kingdom Nationwide`
                      : `Gini Coefficient in ${selectedCentre}`}
                  </h3>
                  <div className="rate-display">
                    {GiniCoeff !== null ? (
                      <>
                        <span className="rate-unit">Gini Coefficient: </span>
                        <span className="rate-value">{GiniCoeff.toFixed(1)}</span>

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
            {selectedCentre === 'all' && selectedIllness &&
              <div className="gradient-legend2">
                <div className="legend-title">Legend</div>
                <div className="legend-labels2">
                  <div className="min-label">Minimum Rate for {selectedIllnessCapitalized}</div>
                  <div className="max-label">Maximum Rate for {selectedIllnessCapitalized}</div>
                </div>
              </div>
            }

            {/* Map markers */}
            {data
              .filter(
                (centre) =>
                  !isNaN(centre.latitude) &&
                  !isNaN(centre.longitude) &&
                  (selectedIllness === '' || centre.illness === selectedIllness)
              )
              .map((centre, index) => {
                const isMin = selectedCentre === "all" && (globalMinCity && centre.assessment_centre === globalMinCity[0].assessment_centre)
                const isMax = selectedCentre === "all" && (globalMaxCity && centre.assessment_centre === globalMaxCity[0].assessment_centre)
                const isMinMax = isMin || isMax
                const isSelected = (centre.assessment_centre === selectedMarker) || isMinMax;
                const illnessRate = selectedIllness ? parseFloat(centre.illness_rate) : null;

                return (
                  <CircleMarker
                    key={`${centre.assessment_centre}-${centre.illness}-${index}`}
                    center={[centre.latitude, centre.longitude]}
                    radius={isSelected ? 12 : 8}
                    pathOptions={{
                      fillColor: isSelected ? isMin ? 'var(--selectedMin)' : isMax ? 'var(--selectedMax)' : 'var(--green)' : 'var(--lightgray)',
                      color: isSelected ? '#333' : '#eee',
                      weight: isSelected ? 2 : 1,
                      opacity: 0.3,
                      fillOpacity: 0.9
                    }}
                    eventHandlers={{
                      click: () => handleMarkerClick(centre.assessment_centre),
                      mouseover: (e) => {
                        const layer = e.target;
                        if (!isSelected) {
                          layer.setStyle({
                            fillColor: 'var(--green)',
                            color: '#333',
                            weight: 1
                          });
                        }
                      },
                      mouseout: (e) => {
                        const layer = e.target;
                        if (!isSelected) {
                          layer.setStyle({
                            fillColor: 'var(--lightgray)',
                            color: '#eee',
                            weight: 1
                          });
                        }
                      }
                    }}
                  >
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
    </div >
  );
}

export default UK;
