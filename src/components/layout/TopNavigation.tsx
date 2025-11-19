import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import VcaLogo from '@/components/VcaLogo';

const TopNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentView, state, setMobileMenuOpen } = useApp();

  const currentPath = location.pathname;

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (currentPath.startsWith('/components')) return 'components';
    if (currentPath.startsWith('/foundations')) return 'components';
    if (currentPath.startsWith('/flows')) return 'flows';
    if (currentPath.startsWith('/builder')) return 'builder';
    return ''; // No tab selected on home page
  };

  const handleTabChange = (value: string) => {
    if (value === 'builder') {
      setCurrentView('builder');
      navigate('/builder');
      return;
    }

    setCurrentView(value as 'components' | 'flows' | 'builder');

    // Navigate to appropriate default page for each tab
    if (value === 'components') {
      navigate('/foundations/typography');
    } else if (value === 'flows') {
      navigate('/flows');
    }
  };

  // Only show hamburger menu on pages that have a sidebar (components/foundations/flows routes)
  const showMobileMenu =
    location.pathname.startsWith('/components') ||
    location.pathname.startsWith('/foundations') ||
    location.pathname.startsWith('/flows');

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        <div className="flex items-center gap-3">
          {/* Hamburger menu button - only visible on mobile for component pages */}
          {showMobileMenu && (
            <button
              onClick={() => setMobileMenuOpen(!state.mobileMenuOpen)}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {state.mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
          <VcaLogo />
        </div>

        <Tabs value={getActiveTab()} onValueChange={handleTabChange}>
          <TabsList className="gap-2">
            <TabsTrigger
              value="components"
              className="shadow-none data-[state=active]:shadow-none data-[state=active]:bg-gray-100 text-sm"
            >
              Components
            </TabsTrigger>
            <TabsTrigger
              value="flows"
              className="shadow-none data-[state=active]:shadow-none data-[state=active]:bg-gray-100 text-sm"
            >
              Playground
            </TabsTrigger>
            <TabsTrigger
              value="builder"
              className="shadow-none data-[state=active]:shadow-none data-[state=active]:bg-gray-100 text-sm"
            >
              Build
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default TopNavigation;

