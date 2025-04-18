import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Papa from 'papaparse';
import { scaleLinear } from 'd3-scale';
import Chart from 'chart.js/auto';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/USA.css';

function USA() {
    const [data, setData] = useState([]);
    const [incomeData, setIncomeData] = useState([]);
    const [states, setStates] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [selectedState, setSelectedState] = useState('all');
    const [selectedCondition, setSelectedCondition] = useState('');
    const [conditionRate, setConditionRate] = useState(null);
    const chartRef = useRef(null);

    const usaBounds = [
        [24.396308, -125.000000],
        [49.384358, -66.934570],
    ];

    useEffect(() => {
        const fetchData = async () => {
            const heartResponse = await fetch('./data/heart_conditions_by_state_with_coordinates.csv');
            const incomeResponse = await fetch('./data/state_disease_income3.csv');

            const heartText = await heartResponse.text();
            const incomeText = await incomeResponse.text();

            // Parse heart conditions data
            Papa.parse(heartText, {
                header: true,
                complete: (result) => {
                    const parsedData = result.data.map((item) => ({
                        ...item,
                        Latitude: parseFloat(item.Latitude),
                        Longitude: parseFloat(item.Longitude),
                    }));
                    setData(parsedData);
                    setStates(['all', ...new Set(parsedData.map((item) => item.State))]);
                },
            });

            // Parse income data
            Papa.parse(incomeText, {
                header: true,
                complete: (result) => {
                    setIncomeData(result.data);

                    const allColumns = result.meta.fields;
                    const diseaseColumns = allColumns.filter(col =>
                        !['State', 'Income'].includes(col)
                    );
                    const uniqueConditions = [...new Set(diseaseColumns)];
                    setConditions(uniqueConditions);
                },
            });
        };
        fetchData();
    }, []);


    useEffect(() => {
        if (selectedState !== 'all' && selectedCondition) {
            updateIncomeChart(selectedState, selectedCondition);
        }
    }, [selectedState, selectedCondition]);

    const handleStateChange = (event) => {
        const state = event.target.value;
        setSelectedState(state);
        updateConditionRate(state, selectedCondition);
        updateIncomeChart(state, selectedCondition);
        updateConditionRate(state, selectedCondition);
    };

    const handleConditionChange = (event) => {
        const condition = event.target.value;
        setSelectedCondition(condition);
        updateConditionRate(selectedState, condition);
        updateIncomeChart(selectedState, condition);
        updateConditionRate(selectedState, condition);
    };

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

    const colorScale = scaleLinear()
        .domain([0, 60])
        .range(['#ffefd5', '#8b0000']);

        const updateIncomeChart = (state, condition) => {
            if (!state || !condition || state === 'all') {
                if (chartRef.current) {
                    chartRef.current.destroy();
                    chartRef.current = null;
                }
                return;
            }
        
            const stateIncomeData = incomeData.filter(item => item.State === state);
        
            if (stateIncomeData.length === 0) {
                console.log(`No income data found for state: ${state}`);
                return;
            }
        
            const incomeCategories = ["<18000", "18-31000", "31-52000", "52-100000", ">100000"];
            const chartData = incomeCategories.map(category => {
                const row = stateIncomeData.find(item => item.Income === category);
                return row && row[condition] ? parseFloat(row[condition]) : 0;
            });
        
            const ctx = document.getElementById('incomeChart');
        
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        
            chartRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: incomeCategories,
                    datasets: [{
                        label: ``,
                        data: chartData,
                        backgroundColor: '#BE0000',
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            display: false, // Hide the legend
                        },
                        title: {
                            display: true, // Display the chart title
                            text: `Prevalence of ${condition} (%) by Income`, // Dynamic title
                            font: {
                                size: 11, // Adjust font size
                                weight: '700', // Make the title bold
                            },
                            padding: {
                                top: 10, // Adjust padding to remove extra space
                                bottom: 10,
                            },
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Prevalence of Disease (%)',
                            },
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Income Bracket (£ Per Year)',
                            },
                        },
                    },
                },
            });
        };

    return (
        <div className="usa-container">
            <Header />

            <div className="usa-content-wrapper">
                <div className="usa-controls-section">
                    <div className="controls-card">
                        <h2>Explore Heart Condition Rates</h2>
                        <div className="dropdown-group">
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
{selectedState !== 'all' && selectedCondition && (
    <div className="chart-container">
        <canvas id="incomeChart" width="400" height="330"></canvas>
    </div>
)}
                    </div>
                    
                    
                </div>

                <div className="map-section">
                    <MapContainer
                        center={[39.8283, -98.5795]}
                        zoom={4}
                        className="leaflet-container"
                        bounds={usaBounds}
                        maxBounds={usaBounds}
                        maxBoundsViscosity={1.0}
                        minZoom={3}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />

                        {data
                            .filter((state) =>
                                !isNaN(state.Latitude) &&
                                !isNaN(state.Longitude) &&
                                (selectedCondition === '' || state[selectedCondition] !== undefined)
                            )
                            .map((state, index) => {
                                const isSelected = state.State === selectedState;
                                const conditionRate = selectedCondition ? parseFloat(state[selectedCondition]) : null;

                                return (
                                    <CircleMarker
                                        key={`${state.State}-${selectedCondition}-${index}`}
                                        center={[state.Latitude, state.Longitude]}
                                        radius={isSelected ? 12 : 8}
                                        pathOptions={{
                                            fillColor: isSelected ? 'var(--green)' : 'var(--lightgray)',
                                            color: isSelected ? '#333' : '#eee',
                                            weight: isSelected ? 2 : 1,
                                            opacity: 0.3,
                                            fillOpacity: 0.9
                                        }}
                                        eventHandlers={{
                                            click: () => {
                                                setSelectedState(state.State);
                                                updateConditionRate(state.State, selectedCondition);
                                            },
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