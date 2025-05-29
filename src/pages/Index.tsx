
import React, { useState } from 'react';
import ClimateMap from '@/components/ClimateMap';
import ClimateSidebar from '@/components/ClimateSidebar';

const Index = () => {
  const [mapData, setMapData] = useState(null);
  const [selectedBoundary, setSelectedBoundary] = useState('district');
  const [selectedIndicator, setSelectedIndicator] = useState('climate_vulnerability');

  const handleBoundaryChange = (boundary: string) => {
    console.log('Boundary changed to:', boundary);
    setSelectedBoundary(boundary);
  };

  const handleFilterChange = (filter: any) => {
    console.log('Filter changed:', filter);
    if (filter.indicator) {
      setSelectedIndicator(filter.indicator);
    }
  };

  const handleDataLoad = (data: any) => {
    setMapData(data);
    console.log('Map data loaded:', data);
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <ClimateSidebar 
        onBoundaryChange={handleBoundaryChange}
        onFilterChange={handleFilterChange}
      />
      <div className="flex-1 relative">
        <ClimateMap 
          onDataLoad={handleDataLoad}
          boundary={selectedBoundary}
          indicator={selectedIndicator}
        />
      </div>
    </div>
  );
};

export default Index;
