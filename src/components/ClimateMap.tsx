
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const ClimateMap = ({ onDataLoad }: { onDataLoad?: (data: any) => void }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const dataLayer = useRef<L.GeoJSON | null>(null);

  const initializeMap = () => {
    if (!mapContainer.current) return;

    // Initialize Leaflet map
    map.current = L.map(mapContainer.current).setView([37.0902, -95.7129], 4);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    // Generate and add climate data
    const climateData = generateMockClimateData();
    
    dataLayer.current = L.geoJSON(climateData, {
      style: (feature) => {
        const vulnerability = feature?.properties?.vulnerability || 0;
        let color = '#22c55e'; // Low vulnerability - green
        
        if (vulnerability > 0.75) color = '#ef4444'; // High - red
        else if (vulnerability > 0.5) color = '#f97316'; // Medium-high - orange
        else if (vulnerability > 0.25) color = '#eab308'; // Medium - yellow
        else if (vulnerability > 0) color = '#84cc16'; // Low-medium - lime
        
        return {
          fillColor: color,
          weight: 2,
          opacity: 1,
          color: 'white',
          fillOpacity: 0.7
        };
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        const popupContent = `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${props?.name || 'Unknown Area'}</h3>
            <p style="margin: 4px 0;">Vulnerability Score: ${((props?.vulnerability || 0) * 100).toFixed(1)}%</p>
            <p style="margin: 4px 0;">Population: ${props?.population?.toLocaleString() || 'N/A'}</p>
          </div>
        `;
        
        layer.bindPopup(popupContent);
        
        layer.on({
          mouseover: (e) => {
            const layer = e.target;
            layer.setStyle({
              weight: 3,
              color: '#666',
              fillOpacity: 0.9
            });
            layer.openPopup();
          },
          mouseout: (e) => {
            dataLayer.current?.resetStyle(e.target);
            e.target.closePopup();
          }
        });
      }
    }).addTo(map.current);

    // Notify parent component that data is loaded
    if (onDataLoad) {
      onDataLoad(climateData);
    }
  };

  const generateMockClimateData = () => {
    const regions = [
      { name: 'California Coast', center: [-119.4179, 36.7783], vulnerability: 0.8 },
      { name: 'Florida Keys', center: [-81.0912, 24.7074], vulnerability: 0.9 },
      { name: 'Louisiana Delta', center: [-89.4012, 29.9511], vulnerability: 0.85 },
      { name: 'Arizona Desert', center: [-111.0937, 34.0489], vulnerability: 0.7 },
      { name: 'Texas Gulf', center: [-94.7963, 29.7604], vulnerability: 0.75 },
      { name: 'Minnesota Lakes', center: [-94.6859, 46.7296], vulnerability: 0.3 },
      { name: 'Vermont Mountains', center: [-72.5806, 44.2601], vulnerability: 0.2 },
      { name: 'Colorado Rockies', center: [-105.7821, 39.5501], vulnerability: 0.4 },
    ];

    const features = regions.map((region, index) => {
      const size = 2; // degrees
      return {
        type: 'Feature' as const,
        properties: {
          name: region.name,
          vulnerability: region.vulnerability,
          population: Math.floor(Math.random() * 500000) + 50000,
          id: index
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [region.center[0] - size, region.center[1] - size],
            [region.center[0] + size, region.center[1] - size],
            [region.center[0] + size, region.center[1] + size],
            [region.center[0] - size, region.center[1] + size],
            [region.center[0] - size, region.center[1] - size]
          ]]
        }
      };
    });

    return {
      type: 'FeatureCollection' as const,
      features
    };
  };

  useEffect(() => {
    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
        <h3 className="font-semibold text-sm mb-1">Climate Vulnerability Index</h3>
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Low</span>
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Medium</span>
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

export default ClimateMap;
