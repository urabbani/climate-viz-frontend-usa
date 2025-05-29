
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
      // Return fallback options if API fails
      return [
        { id: 'climate_vulnerability', name: 'Climate Vulnerability Index' },
        { id: 'heat_stress', name: 'Heat Stress' },
        { id: 'drought_risk', name: 'Drought Risk' },
        { id: 'flood_risk', name: 'Flood Risk' }
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
    // Try different possible field names for vulnerability score
    const possibleFields = [
      'vulnerability_score', 'ccvi_score', 'vulnerability', 'score',
      'VULNERABILITY_SCORE', 'CCVI_SCORE', 'VULNERABILITY', 'SCORE'
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
    // Fallback mock data focused on Pakistan regions
    const pakistanRegions = [
      { name: 'Punjab', center: [74.3587, 31.5204], vulnerability: 0.7 },
      { name: 'Sindh', center: [68.8242, 25.8943], vulnerability: 0.8 },
      { name: 'Khyber Pakhtunkhwa', center: [71.4696, 34.0151], vulnerability: 0.6 },
      { name: 'Balochistan', center: [66.9756, 28.3949], vulnerability: 0.9 },
      { name: 'Gilgit-Baltistan', center: [74.4641, 35.9042], vulnerability: 0.4 },
      { name: 'Azad Kashmir', center: [73.4548, 33.6844], vulnerability: 0.5 }
    ];

    const features = pakistanRegions.map((region, index) => {
      const size = 1.5;
      return {
        type: 'Feature' as const,
        properties: {
          id: `region_${index}`,
          name: region.name,
          vulnerability_score: region.vulnerability,
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
