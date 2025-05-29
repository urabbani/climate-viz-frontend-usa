
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ClimateMap = ({ onDataLoad }: { onDataLoad?: (data: any) => void }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-95.7129, 37.0902], // Center of USA
      zoom: 4,
      pitch: 0,
      bearing: 0
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: false,
      }),
      'top-right'
    );

    // Add zoom and rotation controls
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.current.on('load', () => {
      // Add mock climate vulnerability data layer
      map.current?.addSource('climate-data', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: generateMockClimateData()
        }
      });

      map.current?.addLayer({
        id: 'climate-vulnerability',
        type: 'fill',
        source: 'climate-data',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'vulnerability'],
            0, '#22c55e',    // Low vulnerability - green
            0.25, '#84cc16', // Low-medium - lime
            0.5, '#eab308',  // Medium - yellow
            0.75, '#f97316', // Medium-high - orange
            1, '#ef4444'     // High vulnerability - red
          ],
          'fill-opacity': 0.7,
          'fill-outline-color': '#ffffff'
        }
      });

      // Add hover effects
      map.current?.on('mouseenter', 'climate-vulnerability', (e) => {
        map.current?.getCanvas().style.cursor = 'pointer';
        
        if (e.features?.[0]) {
          const feature = e.features[0];
          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
          })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">${feature.properties?.name || 'Unknown Area'}</h3>
                <p>Vulnerability Score: ${(feature.properties?.vulnerability * 100).toFixed(1)}%</p>
                <p>Population: ${feature.properties?.population?.toLocaleString() || 'N/A'}</p>
              </div>
            `)
            .addTo(map.current!);
          
          // Store popup reference for cleanup
          (map.current as any)._currentPopup = popup;
        }
      });

      map.current?.on('mouseleave', 'climate-vulnerability', () => {
        map.current?.getCanvas().style.cursor = '';
        
        if ((map.current as any)._currentPopup) {
          (map.current as any)._currentPopup.remove();
          (map.current as any)._currentPopup = null;
        }
      });

      // Notify parent component that data is loaded
      if (onDataLoad) {
        onDataLoad(generateMockClimateData());
      }
    });

    setShowTokenInput(false);
  };

  const generateMockClimateData = () => {
    const features = [];
    // Generate mock data for different regions
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

    regions.forEach((region, index) => {
      // Create a rough polygon around each region center
      const size = 2; // degrees
      features.push({
        type: 'Feature',
        properties: {
          name: region.name,
          vulnerability: region.vulnerability,
          population: Math.floor(Math.random() * 500000) + 50000,
          id: index
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [region.center[0] - size, region.center[1] - size],
            [region.center[0] + size, region.center[1] - size],
            [region.center[0] + size, region.center[1] + size],
            [region.center[0] - size, region.center[1] + size],
            [region.center[0] - size, region.center[1] - size]
          ]]
        }
      });
    });

    return features;
  };

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  if (showTokenInput) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">Setup Required</h3>
          <p className="text-gray-600 mb-4">
            To display the map, please enter your Mapbox public token. 
            You can get one from <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">mapbox.com</a>
          </p>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter your Mapbox public token..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <Button 
              onClick={initializeMap}
              disabled={!mapboxToken}
              className="w-full"
            >
              Initialize Map
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg">
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
