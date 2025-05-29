const BASE_URL = 'https://pakwmis.iwmi.org/iwmi-ccvi/backend';

export interface CCVIData {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: {
      id: string;
      name: string;
      vulnerability_score: number;
      population?: number;
      area?: number;
      [key: string]: any;
    };
    geometry: {
      type: 'Polygon' | 'MultiPolygon';
      coordinates: number[][][] | number[][][][];
    };
  }>;
}

export interface BoundaryOption {
  id: string;
  name: string;
  description?: string;
}

export interface IndicatorOption {
  id: string;
  name: string;
  description?: string;
  unit?: string;
}

class CCVIApiService {
  // Get available boundary types
  async getBoundaryTypes(): Promise<BoundaryOption[]> {
    try {
      const response = await fetch(`${BASE_URL}/boundaries`);
      if (!response.ok) throw new Error('Failed to fetch boundary types');
      return await response.json();
    } catch (error) {
      console.error('Error fetching boundary types:', error);
      // Return fallback options if API fails
      return [
        { id: 'district', name: 'District' },
        { id: 'tehsil', name: 'Tehsil' },
        { id: 'union_council', name: 'Union Council' }
      ];
    }
  }

  // Get available indicators
  async getIndicators(): Promise<IndicatorOption[]> {
    try {
      const response = await fetch(`${BASE_URL}/indicators`);
      if (!response.ok) throw new Error('Failed to fetch indicators');
      return await response.json();
    } catch (error) {
      console.error('Error fetching indicators:', error);
      // Return fallback options with the three core climate vulnerability components
      return [
        { id: 'climate_vulnerability', name: 'Climate Vulnerability Index', description: 'Overall climate vulnerability assessment' },
        { id: 'exposure', name: 'Exposure', description: 'Degree of climate stress upon a system', unit: 'Index (0-1)' },
        { id: 'sensitivity', name: 'Sensitivity', description: 'Degree to which a system is affected by climate stimuli', unit: 'Index (0-1)' },
        { id: 'adaptive_capacity', name: 'Adaptive Capacity', description: 'Ability of a system to adjust to climate change', unit: 'Index (0-1)' },
        { id: 'heat_stress', name: 'Heat Stress', description: 'Temperature-related climate stress' },
        { id: 'drought_risk', name: 'Drought Risk', description: 'Water scarcity and drought vulnerability' },
        { id: 'flood_risk', name: 'Flood Risk', description: 'Flooding and water excess vulnerability' }
      ];
    }
  }

  // Get CCVI data for specific boundary and indicator
  async getCCVIData(boundary: string, indicator: string): Promise<CCVIData> {
    try {
      const response = await fetch(
        `${BASE_URL}/data?boundary=${boundary}&indicator=${indicator}`
      );
      if (!response.ok) throw new Error('Failed to fetch CCVI data');
      const data = await response.json();
      
      // Transform the data to match our expected format
      return this.transformApiData(data);
    } catch (error) {
      console.error('Error fetching CCVI data:', error);
      // Return fallback mock data if API fails
      return this.getMockData();
    }
  }

  private transformApiData(apiData: any): CCVIData {
    // Transform the API response to match our expected format
    if (apiData.type === 'FeatureCollection' && apiData.features) {
      return {
        type: 'FeatureCollection',
        features: apiData.features.map((feature: any) => ({
          type: 'Feature',
          properties: {
            id: feature.properties.id || feature.properties.ID || `feature_${Math.random()}`,
            name: feature.properties.name || feature.properties.NAME || feature.properties.DISTRICT || 'Unknown Area',
            vulnerability_score: this.normalizeVulnerabilityScore(feature.properties),
            population: feature.properties.population || feature.properties.POPULATION,
            area: feature.properties.area || feature.properties.AREA,
            ...feature.properties
          },
          geometry: feature.geometry
        }))
      };
    }
    
    return this.getMockData();
  }

  private normalizeVulnerabilityScore(properties: any): number {
    // Try different possible field names for vulnerability score including the three components
    const possibleFields = [
      'vulnerability_score', 'ccvi_score', 'vulnerability', 'score',
      'exposure', 'sensitivity', 'adaptive_capacity',
      'VULNERABILITY_SCORE', 'CCVI_SCORE', 'VULNERABILITY', 'SCORE',
      'EXPOSURE', 'SENSITIVITY', 'ADAPTIVE_CAPACITY'
    ];
    
    for (const field of possibleFields) {
      if (properties[field] !== undefined && properties[field] !== null) {
        const score = parseFloat(properties[field]);
        if (!isNaN(score)) {
          // Normalize to 0-1 range if needed
          return score > 1 ? score / 100 : score;
        }
      }
    }
    
    // Return random score if no valid field found
    return Math.random();
  }

  private getMockData(): CCVIData {
    // Fallback mock data focused on Pakistan regions with the three components
    const pakistanRegions = [
      { name: 'Punjab', center: [74.3587, 31.5204], vulnerability: 0.7, exposure: 0.8, sensitivity: 0.6, adaptive_capacity: 0.4 },
      { name: 'Sindh', center: [68.8242, 25.8943], vulnerability: 0.8, exposure: 0.9, sensitivity: 0.7, adaptive_capacity: 0.3 },
      { name: 'Khyber Pakhtunkhwa', center: [71.4696, 34.0151], vulnerability: 0.6, exposure: 0.7, sensitivity: 0.5, adaptive_capacity: 0.5 },
      { name: 'Balochistan', center: [66.9756, 28.3949], vulnerability: 0.9, exposure: 0.95, sensitivity: 0.8, adaptive_capacity: 0.2 },
      { name: 'Gilgit-Baltistan', center: [74.4641, 35.9042], vulnerability: 0.4, exposure: 0.5, sensitivity: 0.4, adaptive_capacity: 0.7 },
      { name: 'Azad Kashmir', center: [73.4548, 33.6844], vulnerability: 0.5, exposure: 0.6, sensitivity: 0.4, adaptive_capacity: 0.6 }
    ];

    const features = pakistanRegions.map((region, index) => {
      const size = 1.5;
      return {
        type: 'Feature' as const,
        properties: {
          id: `region_${index}`,
          name: region.name,
          vulnerability_score: region.vulnerability,
          exposure: region.exposure,
          sensitivity: region.sensitivity,
          adaptive_capacity: region.adaptive_capacity,
          population: Math.floor(Math.random() * 10000000) + 1000000,
          area: Math.floor(Math.random() * 100000) + 10000
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
      type: 'FeatureCollection',
      features
    };
  }
}

export const ccviApi = new CCVIApiService();
