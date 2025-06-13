import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import {
  BarChart2,
  Users,
  ShoppingCart,
  Settings,
  Menu,
  X
} from 'lucide-react';

const Sidebar = () => {
  const { isSidebarCollapsed, toggleSidebar } = useAdmin();

  const navItems = [
    {
      path: '/admin/dashboard',
      icon: BarChart2,
      label: 'Dashboard'
    },
    {
      path: '/admin/users',
      icon: Users,
      label: 'Users'
    },
    {
      path: '/admin/transactions',
      icon: ShoppingCart,
      label: 'Transactions'
    },
    {
      path: '/admin/services',
      icon: Settings,
      label: 'Services'
    }
  ];

  return (
    <div
      className={`bg-blue-800 text-white h-screen transition-all duration-300 ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        {!isSidebarCollapsed && (
          <h1 className="text-xl font-bold">JAMB Advisor Admin</h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isSidebarCollapsed ? <Menu size={24} /> : <X size={24} />}
        </button>
      </div>

      <nav className="mt-8">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 transition-colors ${
                isActive
                  ? 'bg-blue-600'
                  : 'hover:bg-blue-700'
              }`
            }
          >
            <item.icon size={20} />
            {!isSidebarCollapsed && (
              <span className="ml-3">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 