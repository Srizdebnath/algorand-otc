import React from 'react';
import { ChartBarIcon, DocumentDuplicateIcon, ClockIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const NavItem = ({ icon: Icon, text, active = false }: { icon: React.ElementType, text: string, active?: boolean }) => (
  <a
    href="#"
    className={`flex items-center gap-x-4 px-4 py-3 rounded-lg transition-colors ${
      active
        ? 'bg-cyan-500 text-black font-bold'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`}
  >
    <Icon className="w-6 h-6" />
    <span>{text}</span>
  </a>
);

function Sidebar() {
  return (
    <aside className="bg-gray-800 p-4 flex flex-col gap-y-2">
      <nav className="flex flex-col gap-y-2">
        <NavItem icon={ChartBarIcon} text="Dashboard" active={true} />
        <NavItem icon={DocumentDuplicateIcon} text="My Offers" />
        <NavItem icon={ClockIcon} text="History" />
        <NavItem icon={Cog6ToothIcon} text="Settings" />
      </nav>
    </aside>
  );
}

export default Sidebar;