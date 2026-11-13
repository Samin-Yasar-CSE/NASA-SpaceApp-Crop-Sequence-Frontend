import axios, { AxiosError, type AxiosInstance } from 'axios';
import type { FarmerProfile } from '@/types/farmerProfile';
import type { FinalResponse, ApiError } from '@/types/recommendation';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export interface HealthStatus {
  status: string;
  [key: string]: unknown;
}

export class CropSeqApiError extends Error {
  public statusCode: number | undefined;
  public errorCode: string | undefined;
  public isNetworkError: boolean;

  constructor(message: string, statusCode?: number, errorCode?: string, isNetworkError = false) {
    super(message);
    this.name = 'CropSeqApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isNetworkError = isNetworkError;
  }
}

function handleAxiosError(error: AxiosError<ApiError>): never {
  if (error.response) {
    const data = error.response.data;
    throw new CropSeqApiError(
      data?.message || `Server error: ${error.response.status}`,
      error.response.status,
      data?.error_code,
      false,
    );
  } else if (error.request) {
    throw new CropSeqApiError(
      'Unable to connect to the CropSeq backend. Please ensure the server is running at ' + API_BASE_URL,
      undefined,
      'NETWORK_ERROR',
      true,
    );
  } else {
    throw new CropSeqApiError(
      error.message || 'An unexpected error occurred while preparing the request.',
      undefined,
      'REQUEST_SETUP_ERROR',
      false,
    );
  }
}

export async function checkHealth(): Promise<HealthStatus> {
  try {
    const response = await apiClient.get<HealthStatus>('/health');
    return response.data;
  } catch (error) {
    throw handleAxiosError(error as AxiosError<ApiError>);
  }
}

export async function getRecommendations(profile: FarmerProfile): Promise<FinalResponse> {
  try {
    const response = await apiClient.post<FinalResponse>(
      '/api/v1/recommendations/optimize',
      profile,
    );
    return response.data;
  } catch (error) {
    throw handleAxiosError(error as AxiosError<ApiError>);
  }
}

export { apiClient };
