import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import VcaLogo from '@/components/VcaLogo';

const TopNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentView } = useApp();

  const currentPath = location.pathname;
  
  // Determine active tab based on current path
  const getActiveTab = () => {
    if (currentPath.startsWith('/components')) return 'components';
    if (currentPath.startsWith('/flows')) return 'flows';
    if (currentPath.startsWith('/builder')) return 'builder';
    return 'components';
  };

  const handleTabChange = (value: string) => {
    if (value === 'builder') {
      // Builder is disabled for MVP, show tooltip or do nothing
      return;
    }
    
    setCurrentView(value as 'components' | 'flows' | 'builder');
    
    // Navigate to appropriate default page for each tab
    if (value === 'components') {
      navigate('/components/message');
    } else {
      navigate(`/${value}`);
    }
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between h-14 px-6">
        <VcaLogo />
        
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
              disabled
              title="Coming in Phase 2"
              className="shadow-none text-sm"
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

