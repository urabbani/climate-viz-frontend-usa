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

  const getColorForIndicator = (value: number, indicator: string) => {
    // Color schemes for different indicators
    switch (indicator) {
      case 'exposure':
        // Blue to red scale for exposure
        if (value > 0.8) return '#dc2626'; // High exposure - dark red
        if (value > 0.6) return '#f97316'; // Medium-high - orange
        if (value > 0.4) return '#eab308'; // Medium - yellow
        if (value > 0.2) return '#3b82f6'; // Low-medium - blue
        return '#1e40af'; // Very low - dark blue
      
      case 'sensitivity':
        // Purple to orange scale for sensitivity
        if (value > 0.8) return '#dc2626'; // High sensitivity - red
        if (value > 0.6) return '#f97316'; // Medium-high - orange
        if (value > 0.4) return '#eab308'; // Medium - yellow
        if (value > 0.2) return '#8b5cf6'; // Low-medium - purple
        return '#6366f1'; // Very low - indigo
      
      case 'adaptive_capacity':
        // Inverse scale: green to red (higher adaptive capacity is better)
        if (value > 0.8) return '#22c55e'; // High capacity - green
        if (value > 0.6) return '#84cc16'; // Medium-high - lime
        if (value > 0.4) return '#eab308'; // Medium - yellow
        if (value > 0.2) return '#f97316'; // Low-medium - orange
        return '#dc2626'; // Very low - red
      
      default:
        // Default vulnerability scale
        if (value > 0.8) return '#ef4444'; // Very high - red
        if (value > 0.6) return '#f97316'; // High - orange
        if (value > 0.4) return '#eab308'; // Medium - yellow
        if (value > 0.2) return '#84cc16'; // Low-medium - lime
        return '#22c55e'; // Low vulnerability - green
    }
  };

  const getIndicatorValue = (properties: any, indicator: string) => {
    switch (indicator) {
      case 'exposure':
        return properties?.exposure || properties?.vulnerability_score || 0;
      case 'sensitivity':
        return properties?.sensitivity || properties?.vulnerability_score || 0;
      case 'adaptive_capacity':
        return properties?.adaptive_capacity || (1 - (properties?.vulnerability_score || 0));
      default:
        return properties?.vulnerability_score || 0;
    }
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
          const indicatorValue = getIndicatorValue(feature?.properties, indicator);
          const color = getColorForIndicator(indicatorValue, indicator);
          
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
          const exposurePercent = ((props?.exposure || 0) * 100).toFixed(1);
          const sensitivityPercent = ((props?.sensitivity || 0) * 100).toFixed(1);
          const adaptiveCapacityPercent = ((props?.adaptive_capacity || 0) * 100).toFixed(1);
          
          const popupContent = `
            <div style="padding: 12px; min-width: 250px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${props?.name || 'Unknown Area'}</h3>
              <div style="margin: 8px 0;">
                <p style="margin: 4px 0; color: #374151;"><strong>Overall Vulnerability:</strong> ${vulnerabilityPercent}%</p>
                <div style="border-left: 3px solid #e5e7eb; padding-left: 8px; margin: 8px 0;">
                  <p style="margin: 2px 0; color: #dc2626;"><strong>Exposure:</strong> ${exposurePercent}%</p>
                  <p style="margin: 2px 0; color: #8b5cf6;"><strong>Sensitivity:</strong> ${sensitivityPercent}%</p>
                  <p style="margin: 2px 0; color: #22c55e;"><strong>Adaptive Capacity:</strong> ${adaptiveCapacityPercent}%</p>
                </div>
              </div>
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

  const getLegendForIndicator = (indicator: string) => {
    const legends = {
      exposure: [
        { color: '#1e40af', label: 'Very Low (0-20%)' },
        { color: '#3b82f6', label: 'Low (20-40%)' },
        { color: '#eab308', label: 'Medium (40-60%)' },
        { color: '#f97316', label: 'High (60-80%)' },
        { color: '#dc2626', label: 'Very High (80-100%)' }
      ],
      sensitivity: [
        { color: '#6366f1', label: 'Very Low (0-20%)' },
        { color: '#8b5cf6', label: 'Low (20-40%)' },
        { color: '#eab308', label: 'Medium (40-60%)' },
        { color: '#f97316', label: 'High (60-80%)' },
        { color: '#dc2626', label: 'Very High (80-100%)' }
      ],
      adaptive_capacity: [
        { color: '#dc2626', label: 'Very Low (0-20%)' },
        { color: '#f97316', label: 'Low (20-40%)' },
        { color: '#eab308', label: 'Medium (40-60%)' },
        { color: '#84cc16', label: 'High (60-80%)' },
        { color: '#22c55e', label: 'Very High (80-100%)' }
      ],
      default: [
        { color: '#22c55e', label: 'Very Low (0-20%)' },
        { color: '#84cc16', label: 'Low (20-40%)' },
        { color: '#eab308', label: 'Medium (40-60%)' },
        { color: '#f97316', label: 'High (60-80%)' },
        { color: '#ef4444', label: 'Very High (80-100%)' }
      ]
    };

    return legends[indicator] || legends.default;
  };

  const currentLegend = getLegendForIndicator(indicator);
  const indicatorTitle = indicator === 'climate_vulnerability' ? 'Climate Vulnerability Index' :
                         indicator === 'adaptive_capacity' ? 'Adaptive Capacity' :
                         indicator.charAt(0).toUpperCase() + indicator.slice(1);

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
        <h3 className="font-semibold text-sm mb-2">{indicatorTitle}</h3>
        <div className="space-y-1 text-xs">
          {currentLegend.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
              <span>{item.label}</span>
            </div>
          ))}
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
