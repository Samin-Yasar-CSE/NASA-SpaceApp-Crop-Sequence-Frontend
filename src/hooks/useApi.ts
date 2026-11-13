import { useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { getRecommendations, CropSeqApiError } from '@/api/cropseqApi';
import type { FarmerProfile } from '@/types/farmerProfile';

export function useSubmitRecommendation() {
  const { dispatch } = useAppContext();

  const submit = useCallback(async (profile: FarmerProfile) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_STEP', payload: 'loading' });

    try {
      const response = await getRecommendations(profile);
      dispatch({ type: 'SET_RECOMMENDATION', payload: response });
      return response;
    } catch (error) {
      const apiError = error instanceof CropSeqApiError
        ? error
        : new CropSeqApiError('An unexpected error occurred. Please try again.', undefined, 'UNKNOWN_ERROR', false);
      dispatch({ type: 'SET_ERROR', payload: apiError });
      throw apiError;
    }
  }, [dispatch]);

  return submit;
}
