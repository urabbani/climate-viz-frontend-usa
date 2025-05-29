
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Layers, Filter, BarChart3, Globe } from 'lucide-react';

interface ClimateSidebarProps {
  onBoundaryChange: (boundary: string) => void;
  onFilterChange: (filter: any) => void;
}

const ClimateSidebar = ({ onBoundaryChange, onFilterChange }: ClimateSidebarProps) => {
  const [selectedBoundary, setSelectedBoundary] = useState('Tract');
  const [selectedIndicator, setSelectedIndicator] = useState('climate_change');

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
          <h1 className="text-xl font-bold text-gray-800">Climate Vulnerability Index</h1>
        </div>

        {/* Map Boundaries Section */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Layers className="h-4 w-4" />
              <span>Map Boundaries</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Geographic Level</label>
              <Select value={selectedBoundary} onValueChange={handleBoundaryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tract">Census Tract</SelectItem>
                  <SelectItem value="County">County</SelectItem>
                  <SelectItem value="State">State</SelectItem>
                </SelectContent>
              </Select>
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
              <Select value={selectedIndicator} onValueChange={handleIndicatorChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="climate_change">Climate Change Risk</SelectItem>
                  <SelectItem value="heat_vulnerability">Heat Vulnerability</SelectItem>
                  <SelectItem value="flood_risk">Flood Risk</SelectItem>
                  <SelectItem value="drought_risk">Drought Risk</SelectItem>
                  <SelectItem value="wildfire_risk">Wildfire Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Filters Section */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Active Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary" className="mr-2">
                USA
              </Badge>
              <Badge variant="secondary" className="mr-2">
                {selectedBoundary}
              </Badge>
              <Badge variant="outline" className="mr-2">
                {selectedIndicator.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                  <span className="text-xs">Low (0-25%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-lime-500 rounded"></div>
                  <span className="text-xs">Low-Med (25-50%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-xs">Medium (50-75%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-xs">Med-High (75-90%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-xs">High (90-100%)</span>
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
              <p><strong>Geographic Context:</strong> United States</p>
              <p><strong>Data Source:</strong> Climate Vulnerability Index</p>
              <p><strong>Last Updated:</strong> 2024</p>
              <Separator className="my-2" />
              <p className="text-xs text-gray-500">
                This map shows mock climate vulnerability data for demonstration purposes. 
                Connect your backend API to display real vulnerability indices.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClimateSidebar;
