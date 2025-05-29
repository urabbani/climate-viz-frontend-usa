
import React, { useState } from 'react';
import ClimateMap from '@/components/ClimateMap';
import ClimateSidebar from '@/components/ClimateSidebar';

const Index = () => {
  const [mapData, setMapData] = useState(null);

  const handleBoundaryChange = (boundary: string) => {
    console.log('Boundary changed to:', boundary);
    // Here you would typically make an API call to your backend
    // to fetch data for the new boundary type
  };

  const handleFilterChange = (filter: any) => {
    console.log('Filter changed:', filter);
    // Here you would typically make an API call to your backend
    // to fetch filtered data
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
        <ClimateMap onDataLoad={handleDataLoad} />
      </div>
    </div>
  );
};

export default Index;
