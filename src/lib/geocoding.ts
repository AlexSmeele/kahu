const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWxleHNtZWVsZSIsImEiOiJjbTk4ZzJxYXUwMHppMnBzZm52eHdzbjhsIn0.NdF7K-qLo1yovGqtXAXfPA';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!address || address.trim() === '') {
    console.error('Empty address provided to geocodeAddress');
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
    
    console.log('Geocoding address:', address);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Mapbox API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      console.log('No geocoding results found for address:', address);
      return null;
    }

    const feature = data.features[0];
    const [longitude, latitude] = feature.center;

    return {
      latitude,
      longitude,
      formatted_address: feature.place_name,
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}
