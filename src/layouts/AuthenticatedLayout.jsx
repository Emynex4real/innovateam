import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserIcon,
  WalletIcon,
  DocumentTextIcon,
  CreditCardIcon,
  PhoneIcon,
  AcademicCapIcon,
  QuestionMarkCircleIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { toast } from 'react-hot-toast';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
  { name: 'Wallet', href: '/wallet', icon: WalletIcon },
  { 
    name: 'Result Checker', 
    href: '/scratch-card/waec-checker', 
    icon: DocumentTextIcon,
    children: [
      { name: 'WAEC', href: '/scratch-card/waec-checker' },
      { name: 'NECO', href: '/scratch-card/neco-checker' },
      { name: 'NBAIS', href: '/scratch-card/nbais-checker' },
      { name: 'NABTEB', href: '/scratch-card/nabteb-checker' },
      { name: 'WAEC GCE', href: '/scratch-card/waec-gce' },
    ],
  },
  { name: 'Buy Data', href: '/buy-data', icon: PhoneIcon },
  { name: 'Buy Airtime', href: '/buy-airtime', icon: CreditCardIcon },
  { 
    name: 'JAMB Services', 
    href: '/buy-admission-letter', 
    icon: AcademicCapIcon,
    children: [
      { name: 'Admission Letter', href: '/buy-admission-letter' },
      { name: 'O-Level Upload', href: '/buy-olevel-upload' },
      { name: 'Pin Vending', href: '/buy-pin-vending' },
      { name: 'Original Result', href: '/buy-original-result' },
      { name: 'CAPS Printing', href: '/reprinting-jamb-caps' },
    ],
  },
  { name: 'Support', href: '/support', icon: QuestionMarkCircleIcon },
];

const AuthenticatedLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        navigate('/login');
      }
    } catch (error) {
      toast.error('Failed to logout. Please try again.');
    }
  };

  const toggleSubmenu = (name) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <Transition show={sidebarOpen} as={React.Fragment}>
        <div className="fixed inset-0 z-40 lg:hidden">
          <Transition.Child
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            />
          </Transition.Child>

          <Transition.Child
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex flex-col flex-1 w-full max-w-xs bg-white">
              <div className="absolute top-0 right-0 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <XMarkIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <img
                    className="h-8 w-auto"
                    src="/logo.svg"
                    alt="Your Company"
                  />
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => (
                    <div key={item.name}>
                      {item.children ? (
                        <>
                          <button
                            onClick={() => toggleSubmenu(item.name)}
                            className={`${
                              location.pathname.startsWith(item.href)
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            } group w-full flex items-center px-2 py-2 text-base font-medium rounded-md`}
                          >
                            <item.icon
                              className={`${
                                location.pathname.startsWith(item.href)
                                  ? 'text-gray-500'
                                  : 'text-gray-400 group-hover:text-gray-500'
                              } mr-4 flex-shrink-0 h-6 w-6`}
                              aria-hidden="true"
                            />
                            {item.name}
                          </button>
                          {openSubmenu === item.name && (
                            <div className="pl-11 space-y-1">
                              {item.children.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  to={subItem.href}
                                  className={`${
                                    location.pathname === subItem.href
                                      ? 'bg-gray-100 text-gray-900'
                                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link
                          to={item.href}
                          className={`${
                            location.pathname === item.href
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                        >
                          <item.icon
                            className={`${
                              location.pathname === item.href
                                ? 'text-gray-500'
                                : 'text-gray-400 group-hover:text-gray-500'
                            } mr-4 flex-shrink-0 h-6 w-6`}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                  >
                    <ArrowLeftOnRectangleIcon
                      className="text-gray-400 group-hover:text-gray-500 mr-4 flex-shrink-0 h-6 w-6"
                      aria-hidden="true"
                    />
                    Logout
                  </button>
                </nav>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Transition>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <img
                className="h-8 w-auto"
                src="/logo.svg"
                alt="Your Company"
              />
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() => toggleSubmenu(item.name)}
                        className={`${
                          location.pathname.startsWith(item.href)
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                      >
                        <item.icon
                          className={`${
                            location.pathname.startsWith(item.href)
                              ? 'text-gray-500'
                              : 'text-gray-400 group-hover:text-gray-500'
                          } mr-3 flex-shrink-0 h-6 w-6`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </button>
                      {openSubmenu === item.name && (
                        <div className="pl-11 space-y-1">
                          {item.children.map((subItem) => (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              className={`${
                                location.pathname === subItem.href
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.href}
                      className={`${
                        location.pathname === item.href
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <item.icon
                        className={`${
                          location.pathname === item.href
                            ? 'text-gray-500'
                            : 'text-gray-400 group-hover:text-gray-500'
                        } mr-3 flex-shrink-0 h-6 w-6`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              <button
                onClick={handleLogout}
                className="w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              >
                <ArrowLeftOnRectangleIcon
                  className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6"
                  aria-hidden="true"
                />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {children}
            </div>
          </div>
      </main>
      </div>
  </div>
);
};

export default AuthenticatedLayout;
