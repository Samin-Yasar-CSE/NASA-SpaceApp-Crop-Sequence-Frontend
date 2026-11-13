import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import ChatAssistantPage from '@/pages/ChatAssistantPage';
import CropSequencePage from '@/pages/CropSequencePage';
import CropSeasonalPage from '@/pages/CropSeasonalPage';
import FurtherCropsPage from '@/pages/FurtherCropsPage';
import FarmerProfilePage from '@/pages/FarmerProfilePage';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        {/* Main Conversational AI Agriculture Assistant Home Screen */}
        <Route path="/" element={<ChatAssistantPage />} />

        {/* Feature 1: Crop Sequence Recommendation & Results */}
        <Route path="/sequence" element={<CropSequencePage />} />
        {/* Preserving existing routes */}
        <Route path="/intake" element={<Navigate to="/sequence" replace />} />
        <Route path="/review" element={<Navigate to="/sequence" replace />} />
        <Route path="/results" element={<Navigate to="/sequence" replace />} />

        {/* Feature 2: Crop Seasonal Variation */}
        <Route path="/seasonal" element={<CropSeasonalPage />} />

        {/* Feature 3: Further Crop Recommendations */}
        <Route path="/recommendations" element={<FurtherCropsPage />} />

        {/* Feature 4: Farmer Features & Soil Telemetry */}
        <Route path="/farm" element={<FarmerProfilePage />} />

        {/* Catch-all redirect to Assistant */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
