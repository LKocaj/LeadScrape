import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Search, Download } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/scrape', icon: Search, label: 'Scrape' },
  { to: '/export', icon: Download, label: 'Export' },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-navy-900 text-white flex flex-col">
      <div className="p-6 border-b border-navy-800">
        <h1 className="text-xl font-bold tracking-tight">LeadScrape</h1>
        <p className="text-navy-400 text-sm mt-1">Lead Generation Tool</p>
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
        <p className="text-navy-500 text-xs">OnCall Automation</p>
      </div>
    </aside>
  );
}
