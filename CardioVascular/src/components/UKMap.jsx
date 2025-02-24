import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import Papa from 'papaparse';
import '../styles/UKDropdown.css';

const UKMap = ({ selectedCentre }) => {
    const [cityData, setCityData] = useState([]);
    const [highlightedCity, setHighlightedCity] = useState(null);

    // Load city data from the CSV file
    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('./data/heart_disease_with_coords.csv');
            const text = await response.text();
            Papa.parse(text, {
                header: true,
                complete: (result) => {
                    setCityData(result.data);
                },
            });
        };

        fetchData();
    }, []);

    // Highlight the selected city
    useEffect(() => {
        if (selectedCentre) {
            const city = cityData.find(
                (item) => item.assessment_centre === selectedCentre
            );
            if (city) {
                setHighlightedCity({
                    name: city.assessment_centre,
                    coordinates: [parseFloat(city.latitude), parseFloat(city.longitude)],
                });
            } else {
                setHighlightedCity(null);
            }
        }
    }, [selectedCentre, cityData]);

    return (
        <MapContainer
            center={[54.5, -2.5]} // Center over the UK
            zoom={6} // Zoom level
            style={{ height: '80vh', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Highlight the selected city */}
            {highlightedCity && (
                <Polygon
                    positions={[
                        [
                            [highlightedCity.coordinates[0] - 0.1, highlightedCity.coordinates[1] - 0.1],
                            [highlightedCity.coordinates[0] - 0.1, highlightedCity.coordinates[1] + 0.1],
                            [highlightedCity.coordinates[0] + 0.1, highlightedCity.coordinates[1] + 0.1],
                            [highlightedCity.coordinates[0] + 0.1, highlightedCity.coordinates[1] - 0.1],
                        ],
                    ]}
                    pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.6 }}
                />
            )}
        </MapContainer>
    );
};

export default UKMap;
