// ─── FinalResponse — Response from POST /api/v1/recommendations/optimize ───

export interface OptimizationSummary {
  primary_objective_achieved: string;
  projected_cumulative_net_return_usd: number;
  soil_health_index_delta: string;
  water_footprint_liters: number;
}

export interface SequenceEntry {
  sequence_index: number;
  season: string;
  recommended_crop: string;
  variety: string;
  confidence_score: number;
  expected_yield_tons_per_hectare: number;
  projected_input_costs_usd: number;
  projected_revenue_usd: number;
  agronomic_rationale: string;
}

export interface SequenceMetrics {
  total_net_profit_usd_ha: number;
  sustainability_score: number;
  water_efficiency_rating: string;
}

export interface ParetoAlternative {
  strategy_name: string;
  trade_off_description: string;
  sequence: Array<{
    year: number;
    crop: string;
    expected_yield_tons_ha?: number;
    water_usage_mm?: number;
    soil_health_impact_index?: number;
  }>;
  metrics: SequenceMetrics;
}

export interface Warning {
  code: string;
  severity: string;
  message: string;
}

export interface RecommendationData {
  farmer_id: string;
  optimization_summary: OptimizationSummary;
  recommended_sequence: SequenceEntry[];
}

export interface FinalResponse {
  status: string;
  timestamp: string;
  data: RecommendationData;
  pareto_optimal_alternatives?: ParetoAlternative[];
  warnings?: Warning[];
}

export interface ApiError {
  status: string;
  error_code: string;
  message: string;
}
