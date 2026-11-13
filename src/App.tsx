import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import LandingPage from '@/pages/LandingPage';
import IntakePage from '@/pages/IntakePage';
import ReviewPage from '@/pages/ReviewPage';
import ResultsPage from '@/pages/ResultsPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/intake" element={<IntakePage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
