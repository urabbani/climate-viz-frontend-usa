
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Layers, Filter, BarChart3, Globe, RefreshCw } from 'lucide-react';
import { ccviApi, BoundaryOption, IndicatorOption } from '@/services/ccviApi';

interface ClimateSidebarProps {
  onBoundaryChange: (boundary: string) => void;
  onFilterChange: (filter: any) => void;
}

const ClimateSidebar = ({ onBoundaryChange, onFilterChange }: ClimateSidebarProps) => {
  const [selectedBoundary, setSelectedBoundary] = useState('district');
  const [selectedIndicator, setSelectedIndicator] = useState('climate_vulnerability');
  const [boundaries, setBoundaries] = useState<BoundaryOption[]>([]);
  const [indicators, setIndicators] = useState<IndicatorOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load available options from API
  useEffect(() => {
    const loadOptions = async () => {
      setIsLoading(true);
      try {
        const [boundaryOptions, indicatorOptions] = await Promise.all([
          ccviApi.getBoundaryTypes(),
          ccviApi.getIndicators()
        ]);
        
        setBoundaries(boundaryOptions);
        setIndicators(indicatorOptions);
        
        console.log('Loaded boundary options:', boundaryOptions);
        console.log('Loaded indicator options:', indicatorOptions);
      } catch (error) {
        console.error('Error loading options:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOptions();
  }, []);

  const handleBoundaryChange = (value: string) => {
    setSelectedBoundary(value);
    onBoundaryChange(value);
  };

  const handleIndicatorChange = (value: string) => {
    setSelectedIndicator(value);
    onFilterChange({ indicator: value });
  };

  return (
    <div className="w-80 bg-white shadow-lg h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Globe className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">IWMI Climate Vulnerability</h1>
        </div>

        {/* Map Boundaries Section */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Layers className="h-4 w-4" />
              <span>Map Boundaries</span>
              {isLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Administrative Level</label>
              <Select 
                value={selectedBoundary} 
                onValueChange={handleBoundaryChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select boundary type" />
                </SelectTrigger>
                <SelectContent>
                  {boundaries.map((boundary) => (
                    <SelectItem key={boundary.id} value={boundary.id}>
                      {boundary.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {boundaries.find(b => b.id === selectedBoundary)?.description && (
                <p className="text-xs text-gray-500 mt-1">
                  {boundaries.find(b => b.id === selectedBoundary)?.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Climate Indicators Section */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Climate Indicators</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Primary Indicator</label>
              <Select 
                value={selectedIndicator} 
                onValueChange={handleIndicatorChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select indicator" />
                </SelectTrigger>
                <SelectContent>
                  {indicators.map((indicator) => (
                    <SelectItem key={indicator.id} value={indicator.id}>
                      {indicator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {indicators.find(i => i.id === selectedIndicator)?.description && (
                <p className="text-xs text-gray-500 mt-1">
                  {indicators.find(i => i.id === selectedIndicator)?.description}
                </p>
              )}
              {indicators.find(i => i.id === selectedIndicator)?.unit && (
                <p className="text-xs text-blue-600 mt-1">
                  Unit: {indicators.find(i => i.id === selectedIndicator)?.unit}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Filters Section */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Active Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary" className="mr-2">
                Pakistan
              </Badge>
              <Badge variant="secondary" className="mr-2">
                {boundaries.find(b => b.id === selectedBoundary)?.name || selectedBoundary}
              </Badge>
              <Badge variant="outline" className="mr-2">
                {indicators.find(i => i.id === selectedIndicator)?.name || selectedIndicator}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Legend Section */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Vulnerability Scale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-xs">Very Low (0-20%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-lime-500 rounded"></div>
                  <span className="text-xs">Low (20-40%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-xs">Medium (40-60%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-xs">High (60-80%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-xs">Very High (80-100%)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Info Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Data Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Geographic Context:</strong> Pakistan</p>
              <p><strong>Data Source:</strong> IWMI Climate Change and Vulnerability Index</p>
              <p><strong>API Endpoint:</strong> pakwmis.iwmi.org</p>
              <p><strong>Last Updated:</strong> Real-time</p>
              <Separator className="my-2" />
              <p className="text-xs text-gray-500">
                This map displays real-time climate vulnerability data from the 
                International Water Management Institute (IWMI) for Pakistan regions.
              </p>
              <a 
                href="https://pakwmis.iwmi.org/iwmi-ccvi/backend/docs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-xs block mt-2"
              >
                View API Documentation
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClimateSidebar;
