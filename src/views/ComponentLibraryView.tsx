import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import MainContent from '@/components/layout/MainContent';
import TypographyView from './TypographyView';
import ColorsView from './ColorsView';
import SpacingView from './SpacingView';
import RadiusView from './RadiusView';
import MessageComponentView from './components/MessageComponentView';
import InformationMessageComponentView from './components/InformationMessageComponentView';
import RecommendationComponentView from './components/RecommendationComponentView';
import AgentStatusComponentView from './components/AgentStatusComponentView';
import SourceLinkComponentView from './components/SourceLinkComponentView';
import SourcesComponentView from './components/SourcesComponentView';
import ButtonComponentView from './components/ButtonComponentView';
import ButtonIconComponentView from './components/ButtonIconComponentView';
import ButtonLinkComponentView from './components/ButtonLinkComponentView';
import PromptComponentView from './components/PromptComponentView';
import PromptGroupComponentView from './components/PromptGroupComponentView';
import ComposerComponentView from './components/ComposerComponentView';
import AvatarComponentView from './components/AvatarComponentView';
import BadgeComponentView from './components/BadgeComponentView';
import HeaderComponentView from './components/HeaderComponentView';
import ContainerComponentView from './components/ContainerComponentView';
import IconsComponentView from './components/IconsComponentView';
import { cn } from '@/utils';

const ComponentLibraryView = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="flex h-full">
      <Sidebar>
        {/* Foundations */}
        <h2 className="text-sm font-medium text-gray-900 mb-4">Foundations</h2>
        <div className="space-y-1 mb-6">
          <Link 
            to="/foundations/typography"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/foundations/typography')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Typography
          </Link>
          <Link 
            to="/foundations/colors"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/foundations/colors')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Colors
          </Link>
          <Link 
            to="/foundations/spacing"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/foundations/spacing')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Spacing
          </Link>
          <Link 
            to="/foundations/radius"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/foundations/radius')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Border Radius
          </Link>
        </div>

        <h2 className="text-sm font-medium text-gray-900 mb-4">Components</h2>
        
        {/* Actions */}
        <div className="space-y-1">
          <div className="text-xs font-normal text-gray-500 mb-2">Actions</div>
          <Link 
            to="/components/button"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/button')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Button
          </Link>
          <Link 
            to="/components/button-icon"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/button-icon')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Button Icon
          </Link>
          <Link 
            to="/components/button-link"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/button-link')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Button Link
          </Link>
          <Link 
            to="/components/prompt"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/prompt')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Prompt
          </Link>
          <Link 
            to="/components/prompt-group"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/prompt-group')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Prompt Group
          </Link>
        </div>
        
        {/* Display */}
        <div className="space-y-1 mt-6">
          <div className="text-xs font-normal text-gray-500 mb-2">Display</div>
          <Link 
            to="/components/avatar"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/avatar')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Avatar
          </Link>
          <Link 
            to="/components/badge"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/badge')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Badge
          </Link>
          <Link 
            to="/components/icons"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/icons')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Icons
          </Link>
        </div>
        
        {/* Input */}
        <div className="space-y-1 mt-6">
          <div className="text-xs font-normal text-gray-500 mb-2">Input</div>
          <Link 
            to="/components/composer"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/composer')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Composer
          </Link>
        </div>
        
        {/* Layout */}
        <div className="space-y-1 mt-6">
          <div className="text-xs font-normal text-gray-500 mb-2">Layout</div>
          <Link 
            to="/components/container"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/container')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Container
          </Link>
          <Link 
            to="/components/header"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/header')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Header
          </Link>
        </div>
        
        {/* Messages */}
        <div className="space-y-1 mt-6">
          <div className="text-xs font-normal text-gray-500 mb-2">Messages</div>
          <Link 
            to="/components/agent-status"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/agent-status')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Agent Status
          </Link>
          <Link 
            to="/components/information-message"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/information-message')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Information Message
          </Link>
          <Link 
            to="/components/message"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/message')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Message
          </Link>
          <Link 
            to="/components/recommendation"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/recommendation')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Recommendation
          </Link>
          <Link 
            to="/components/source-link"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/source-link')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Source Link
          </Link>
          <Link 
            to="/components/sources"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/sources')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Sources
          </Link>
        </div>
      </Sidebar>

      <MainContent>
        <Routes>
          {/* Foundation Routes */}
          <Route path="typography" element={<TypographyView />} />
          <Route path="colors" element={<ColorsView />} />
          <Route path="spacing" element={<SpacingView />} />
          <Route path="radius" element={<RadiusView />} />
          
          {/* Component Routes */}
          <Route index element={<Navigate to="/components/message" replace />} />
          <Route path="message" element={<MessageComponentView />} />
          <Route path="information-message" element={<InformationMessageComponentView />} />
          <Route path="recommendation" element={<RecommendationComponentView />} />
          <Route path="agent-status" element={<AgentStatusComponentView />} />
          <Route path="source-link" element={<SourceLinkComponentView />} />
          <Route path="sources" element={<SourcesComponentView />} />
          <Route path="composer" element={<ComposerComponentView />} />
          <Route path="container" element={<ContainerComponentView />} />
          <Route path="header" element={<HeaderComponentView />} />
          <Route path="avatar" element={<AvatarComponentView />} />
          <Route path="badge" element={<BadgeComponentView />} />
          <Route path="icons" element={<IconsComponentView />} />
          <Route path="button" element={<ButtonComponentView />} />
          <Route path="button-icon" element={<ButtonIconComponentView />} />
          <Route path="button-link" element={<ButtonLinkComponentView />} />
          <Route path="prompt" element={<PromptComponentView />} />
          <Route path="prompt-group" element={<PromptGroupComponentView />} />
        </Routes>
      </MainContent>
    </div>
  );
};

export default ComponentLibraryView;

