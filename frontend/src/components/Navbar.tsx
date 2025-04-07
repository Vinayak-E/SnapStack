import { useEffect, useState } from 'react';
import { useAppSelector } from '../app/hooks';

interface NavbarProps {
  onLogout: () => void;
}

const Navbar = ({ onLogout }: NavbarProps) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user } = useAppSelector(state => state.auth);

  const handleOutsideClick = (e: MouseEvent) => {
    if (!e.target || !(e.target instanceof HTMLElement)) return;
    if (!e.target.closest('#user-menu') && isProfileMenuOpen) {
      setIsProfileMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isProfileMenuOpen]);

  return (
    <nav className="bg-indigo-600 dark:bg-indigo-800 shadow-lg transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <span className="text-white text-3xl font-bold tracking-tight">SnapStack</span>
          </div>
          
          <div className="flex items-center">
            <div className="relative">
              <button
                type="button"
                className="flex items-center space-x-2 text-white hover:bg-indigo-700 dark:hover:bg-indigo-900 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white transition-colors duration-200"
                id="user-menu"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-indigo-800 dark:bg-indigo-900 flex items-center justify-center text-white font-medium shadow-md">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline text-sm font-medium">
                  {user?.email.split('@')[0] || 'User'}
                </span>
              </button>

              {isProfileMenuOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-64 rounded-lg shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10 transition-all duration-200 ease-in-out"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {user?.email || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Signed in
                    </p>
                  </div>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-150"
                    role="menuitem"
                    onClick={() => {
                      onLogout();
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;