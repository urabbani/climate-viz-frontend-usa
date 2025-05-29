
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ccviApi, CCVIData } from '@/services/ccviApi';

interface ClimateMapProps {
  onDataLoad?: (data: any) => void;
  boundary?: string;
  indicator?: string;
}

const ClimateMap = ({ onDataLoad, boundary = 'district', indicator = 'climate_vulnerability' }: ClimateMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const dataLayer = useRef<L.GeoJSON | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeMap = async () => {
    if (!mapContainer.current) return;

    // Initialize Leaflet map centered on Pakistan
    map.current = L.map(mapContainer.current).setView([30.3753, 69.3451], 6);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    // Load initial data
    await loadClimateData();
  };

  const loadClimateData = async () => {
    if (!map.current) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Loading CCVI data for boundary: ${boundary}, indicator: ${indicator}`);
      
      const climateData = await ccviApi.getCCVIData(boundary, indicator);
      
      // Remove existing data layer if it exists
      if (dataLayer.current) {
        map.current.removeLayer(dataLayer.current);
      }

      // Add new data layer
      dataLayer.current = L.geoJSON(climateData, {
        style: (feature) => {
          const vulnerability = feature?.properties?.vulnerability_score || 0;
          let color = '#22c55e'; // Low vulnerability - green
          
          if (vulnerability > 0.8) color = '#ef4444'; // Very high - red
          else if (vulnerability > 0.6) color = '#f97316'; // High - orange
          else if (vulnerability > 0.4) color = '#eab308'; // Medium - yellow
          else if (vulnerability > 0.2) color = '#84cc16'; // Low-medium - lime
          
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
          const vulnerabilityPercent = ((props?.vulnerability_score || 0) * 100).toFixed(1);
          
          const popupContent = `
            <div style="padding: 12px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${props?.name || 'Unknown Area'}</h3>
              <p style="margin: 4px 0; color: #374151;"><strong>Vulnerability Score:</strong> ${vulnerabilityPercent}%</p>
              ${props?.population ? `<p style="margin: 4px 0; color: #374151;"><strong>Population:</strong> ${props.population.toLocaleString()}</p>` : ''}
              ${props?.area ? `<p style="margin: 4px 0; color: #374151;"><strong>Area:</strong> ${props.area.toLocaleString()} km²</p>` : ''}
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280;">Boundary: ${boundary} | Indicator: ${indicator}</p>
            </div>
          `;
          
          layer.bindPopup(popupContent);
          
          layer.on({
            mouseover: (e) => {
              const layer = e.target;
              layer.setStyle({
                weight: 3,
                color: '#1f2937',
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

      // Fit map to data bounds
      if (climateData.features.length > 0) {
        map.current.fitBounds(dataLayer.current.getBounds(), { padding: [20, 20] });
      }

      // Notify parent component that data is loaded
      if (onDataLoad) {
        onDataLoad(climateData);
      }

      console.log('CCVI data loaded successfully:', climateData);
      
    } catch (error) {
      console.error('Error loading climate data:', error);
      setError('Failed to load climate vulnerability data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reload data when boundary or indicator changes
  useEffect(() => {
    if (map.current) {
      loadClimateData();
    }
  }, [boundary, indicator]);

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
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
        <h3 className="font-semibold text-sm mb-2">Climate Vulnerability Index</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Very Low (0-20%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-lime-500 rounded"></div>
            <span>Low (20-40%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Medium (40-60%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>High (60-80%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Very High (80-100%)</span>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Loading data...</span>
          </div>
        </div>
      )}

      {/* Error indicator */}
      {error && (
        <div className="absolute top-4 right-4 bg-red-50 border border-red-200 p-3 rounded-lg shadow-lg z-[1000] max-w-xs">
          <div className="flex items-start space-x-2">
            <div className="text-red-500 mt-0.5">⚠</div>
            <div>
              <h4 className="text-sm font-medium text-red-800">Error</h4>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Data source info */}
      <div className="absolute bottom-4 right-4 bg-white/90 px-2 py-1 rounded text-xs text-gray-600 z-[1000]">
        Data: IWMI Climate Change and Vulnerability Index
      </div>
    </div>
  );
};

export default ClimateMap;
