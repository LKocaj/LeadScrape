import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { ScrapePage } from './pages/ScrapePage';
import { ExportPage } from './pages/ExportPage';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/scrape" element={<ScrapePage />} />
        <Route path="/export" element={<ExportPage />} />
      </Routes>
    </AppLayout>
  );
}
