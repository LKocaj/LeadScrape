import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { ScrapePage } from './pages/ScrapePage';
import { ExportPage } from './pages/ExportPage';
import { ImportPage } from './pages/ImportPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/scrape" element={<ScrapePage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/export" element={<ExportPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </AppLayout>
  );
}
