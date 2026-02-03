import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Search, Upload, Download, BarChart3 } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/scrape', icon: Search, label: 'Scrape' },
  { to: '/import', icon: Upload, label: 'Import' },
  { to: '/export', icon: Download, label: 'Export' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-navy-900 text-white flex flex-col">
      <div className="p-6 border-b border-navy-800">
        <div className="flex items-center gap-3">
          <img src="/oncall-logo.png" alt="OnCall" className="w-10 h-10 rounded-full" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">LeadScrape</h1>
            <p className="text-navy-400 text-sm">by OnCall Automation</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-navy-800 text-white'
                      : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                  }`
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-navy-800">
        <a
          href="https://oncallautomation.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-navy-400 text-xs hover:text-white transition-colors"
        >
          oncallautomation.ai
        </a>
      </div>
    </aside>
  );
}
