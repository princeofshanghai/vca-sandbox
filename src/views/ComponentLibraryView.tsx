import { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import MainContent from '@/components/layout/MainContent';
import TypographyView from './TypographyView';
import ColorsView from './ColorsView';
import SpacingView from './SpacingView';
import RadiusView from './RadiusView';
import MessageComponentView from './components/MessageComponentView';
import InfoMessageComponentView from './components/InfoMessageComponentView';
import ActionMessageComponentView from './components/ActionMessageComponentView';
import AgentStatusComponentView from './components/AgentStatusComponentView';
import ThinkingIndicatorComponentView from './components/ThinkingIndicatorComponentView';
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
import AgentBannerComponentView from './components/AgentBannerComponentView';
import DividerComponentView from './components/DividerComponentView';
import { cn } from '@/utils';

const ComponentLibraryView = () => {
  const location = useLocation();
  const [foundationsExpanded, setFoundationsExpanded] = useState(true);
  const [componentsExpanded, setComponentsExpanded] = useState(true);
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="flex h-full">
      <Sidebar>
        {/* Foundations */}
        <button
          onClick={() => setFoundationsExpanded(!foundationsExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-4 cursor-pointer hover:text-gray-700 transition-colors w-full"
        >
          <span>Foundations</span>
          <svg
            className={cn("w-3 h-3 transition-transform", foundationsExpanded ? "rotate-0" : "-rotate-90")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {foundationsExpanded && (
        <div className="space-y-0.5 mb-6">
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
            to="/foundations/icons"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/foundations/icons')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Icons
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
        )}

        <button
          onClick={() => setComponentsExpanded(!componentsExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-4 cursor-pointer hover:text-gray-700 transition-colors w-full"
        >
          <span>Components</span>
          <svg
            className={cn("w-3 h-3 transition-transform", componentsExpanded ? "rotate-0" : "-rotate-90")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {componentsExpanded && (
        <>
        
        {/* Actions */}
        <div className="space-y-0.5">
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
        <div className="space-y-0.5 mt-6">
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
            to="/components/divider"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/divider')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Divider
          </Link>
          <Link 
            to="/components/agent-banner"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/agent-banner')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Agent Banner
          </Link>
        </div>
        
        {/* Layout */}
        <div className="space-y-0.5 mt-6">
          <div className="text-xs font-normal text-gray-500 mb-2">Layout</div>
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
        <div className="space-y-0.5 mt-6">
          <div className="text-xs font-normal text-gray-500 mb-2">Messages</div>
          <Link 
            to="/components/action-message"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/action-message')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Action Message
          </Link>
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
            to="/components/info-message"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/info-message')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Info Message
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
          <Link 
            to="/components/thinking-indicator"
            className={cn(
              "block text-left px-3 py-2 text-2xs rounded transition-colors",
              isActive('/components/thinking-indicator')
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Thinking Indicator
          </Link>
        </div>
        </>
        )}
      </Sidebar>

      <MainContent>
        <Routes>
          {/* Foundation Routes */}
          <Route path="typography" element={<TypographyView />} />
          <Route path="colors" element={<ColorsView />} />
          <Route path="icons" element={<IconsComponentView />} />
          <Route path="spacing" element={<SpacingView />} />
          <Route path="radius" element={<RadiusView />} />
          
          {/* Component Routes */}
          <Route index element={<Navigate to="/components/message" replace />} />
          <Route path="message" element={<MessageComponentView />} />
          <Route path="info-message" element={<InfoMessageComponentView />} />
          <Route path="action-message" element={<ActionMessageComponentView />} />
          <Route path="agent-status" element={<AgentStatusComponentView />} />
          <Route path="thinking-indicator" element={<ThinkingIndicatorComponentView />} />
          <Route path="source-link" element={<SourceLinkComponentView />} />
          <Route path="sources" element={<SourcesComponentView />} />
          <Route path="composer" element={<ComposerComponentView />} />
          <Route path="container" element={<ContainerComponentView />} />
          <Route path="header" element={<HeaderComponentView />} />
          <Route path="divider" element={<DividerComponentView />} />
          <Route path="agent-banner" element={<AgentBannerComponentView />} />
          <Route path="avatar" element={<AvatarComponentView />} />
          <Route path="badge" element={<BadgeComponentView />} />
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

