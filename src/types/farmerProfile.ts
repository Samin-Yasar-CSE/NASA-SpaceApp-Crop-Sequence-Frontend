// ─── Farmer Profile — Request payload for POST /api/v1/recommendations/optimize ───

export interface FarmLocation {
  latitude: number;
  longitude: number;
  region: string;
  country: string;
}

export interface SoilProfile {
  texture: string;
  ph: number;
  organic_matter_percent: number;
  nitrogen_n_ppm: number;
  phosphorus_p_ppm: number;
  potassium_k_ppm: number;
}

export interface FarmMetadata {
  location: FarmLocation;
  total_area_hectares: number;
  irrigation_type: string;
  soil_profile: SoilProfile;
}

export interface PlanningHorizon {
  start_year: number;
  number_of_seasons: number;
  seasons: string[];
}

export interface PreviousCrop {
  season: string;
  crop_name: string;
}

export interface HistoricalData {
  previous_crops: PreviousCrop[];
  fallow_history_seasons: number;
}

export interface ConstraintsAndPreferences {
  primary_objective: string;
  target_crops: string[];
  excluded_crops: string[];
  risk_tolerance: string;
  available_capital_usd: number;
  labor_availability: string;
}

export interface FarmerProfile {
  farmer_id?: string;
  farm_metadata: FarmMetadata;
  planning_horizon: PlanningHorizon;
  historical_data: HistoricalData;
  constraints_and_preferences: ConstraintsAndPreferences;
}
