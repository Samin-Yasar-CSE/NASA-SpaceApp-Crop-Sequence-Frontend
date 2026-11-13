import type { FarmerProfile } from '@/types/farmerProfile';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateFarmerProfile(profile: Partial<FarmerProfile>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Farm location
  if (!profile.farm_metadata?.location?.latitude && profile.farm_metadata?.location?.latitude !== 0) {
    errors.push({ field: 'latitude', message: 'Latitude is required.' });
  } else if (profile.farm_metadata.location.latitude < -90 || profile.farm_metadata.location.latitude > 90) {
    errors.push({ field: 'latitude', message: 'Latitude must be between -90 and 90.' });
  }

  if (!profile.farm_metadata?.location?.longitude && profile.farm_metadata?.location?.longitude !== 0) {
    errors.push({ field: 'longitude', message: 'Longitude is required.' });
  } else if (profile.farm_metadata.location.longitude < -180 || profile.farm_metadata.location.longitude > 180) {
    errors.push({ field: 'longitude', message: 'Longitude must be between -180 and 180.' });
  }

  if (!profile.farm_metadata?.location?.region?.trim()) {
    errors.push({ field: 'region', message: 'Region is required.' });
  }

  if (!profile.farm_metadata?.location?.country?.trim()) {
    errors.push({ field: 'country', message: 'Country is required.' });
  }

  // Farm metadata
  if (!profile.farm_metadata?.total_area_hectares || profile.farm_metadata.total_area_hectares <= 0) {
    errors.push({ field: 'total_area_hectares', message: 'Total farm area must be greater than 0.' });
  }

  if (!profile.farm_metadata?.irrigation_type?.trim()) {
    errors.push({ field: 'irrigation_type', message: 'Irrigation type is required.' });
  }

  // Soil profile
  const soil = profile.farm_metadata?.soil_profile;
  if (!soil?.texture?.trim()) {
    errors.push({ field: 'soil_texture', message: 'Soil texture is required.' });
  }

  if (soil?.ph === undefined || soil.ph === null) {
    errors.push({ field: 'soil_ph', message: 'Soil pH is required.' });
  } else if (soil.ph < 0 || soil.ph > 14) {
    errors.push({ field: 'soil_ph', message: 'Soil pH must be between 0 and 14.' });
  }

  if (!soil?.organic_matter_percent && soil?.organic_matter_percent !== 0) {
    errors.push({ field: 'organic_matter', message: 'Organic matter percentage is required.' });
  }

  // Planning horizon
  if (!profile.planning_horizon?.number_of_seasons || profile.planning_horizon.number_of_seasons < 1) {
    errors.push({ field: 'number_of_seasons', message: 'Number of seasons must be at least 1.' });
  }

  if (!profile.planning_horizon?.seasons?.length) {
    errors.push({ field: 'seasons', message: 'At least one season type must be specified.' });
  }

  // Constraints
  if (!profile.constraints_and_preferences?.primary_objective?.trim()) {
    errors.push({ field: 'primary_objective', message: 'Primary objective is required.' });
  }

  if (!profile.constraints_and_preferences?.risk_tolerance?.trim()) {
    errors.push({ field: 'risk_tolerance', message: 'Risk tolerance is required.' });
  }

  return errors;
}

export function formatFieldLabel(field: string): string {
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
