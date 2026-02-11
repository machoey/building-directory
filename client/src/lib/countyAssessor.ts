/**
 * County Assessor Data Verification
 * 
 * Since San Mateo County doesn't provide a public API, we use Google Places API
 * to verify and fetch property details.
 */

const GOOGLE_MAPS_API_KEY = 'AIzaSyAbEQ1rnR8YhU8RZwXRNU87sqmRJaBeTtY';

export interface AssessorData {
  address?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  propertyType?: string;
  formattedAddress?: string;
  source: string;
  confidence: 'high' | 'medium' | 'low';
  notes: string;
}

/**
 * Verify address and fetch property data using Google Places API
 */
export async function verifyWithAssessor(
  address: string,
  city: string,
  state: string
): Promise<AssessorData> {
  try {
    const fullAddress = `${address}, ${city}, ${state}`;
    
    // Geocode the address to get coordinates and place details
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_MAPS_API_KEY}`;
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();
    
    if (geocodeData.status !== 'OK' || !geocodeData.results?.[0]) {
      throw new Error('Address not found or invalid');
    }
    
    const result = geocodeData.results[0];
    const location = result.geometry.location;
    const addressComponents = result.address_components;
    const formattedAddress = result.formatted_address;
    
    // Extract city and state from address components
    let extractedCity = '';
    let extractedState = '';
    let streetNumber = '';
    let route = '';
    
    for (const component of addressComponents) {
      if (component.types.includes('locality')) {
        extractedCity = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        extractedState = component.short_name;
      }
      if (component.types.includes('street_number')) {
        streetNumber = component.long_name;
      }
      if (component.types.includes('route')) {
        route = component.long_name;
      }
    }
    
    // Determine property type from types
    const types = result.types || [];
    let propertyType = 'Building';
    if (types.includes('apartment_complex')) {
      propertyType = 'Apartment Complex';
    } else if (types.includes('condominium_complex')) {
      propertyType = 'Condominium Complex';
    } else if (types.includes('premise')) {
      propertyType = 'Residential Building';
    }
    
    const cleanAddress = streetNumber && route ? `${streetNumber} ${route}` : address;
    
    return {
      address: cleanAddress,
      city: extractedCity || city,
      state: extractedState || state,
      latitude: location.lat,
      longitude: location.lng,
      propertyType,
      formattedAddress,
      source: 'Google Geocoding API',
      confidence: 'high',
      notes: 'Address verified and coordinates updated. Property type identified. Year built and unit count require manual entry or county records.',
    };
  } catch (error) {
    console.error('Error verifying with assessor:', error);
    throw error;
  }
}
