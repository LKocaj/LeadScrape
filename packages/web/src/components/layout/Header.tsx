import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/leads': 'Leads',
  '/scrape': 'Scrape',
  '/export': 'Export',
};

export function Header() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'LeadScrape';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
      <h2 className="text-lg font-semibold text-navy-900">{title}</h2>
    </header>
  );
}
