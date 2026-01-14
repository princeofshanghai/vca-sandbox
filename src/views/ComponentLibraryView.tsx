import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import MainContent from '@/components/layout/MainContent';
import CollapsibleSection from '@/components/layout/CollapsibleSection';
import NavLink from '@/components/layout/NavLink';
import NavigationGroup from '@/components/layout/NavigationGroup';
import { componentNavigation } from '@/config/componentNavigation';
import { useApp } from '@/contexts/AppContext';
import TypographyView from './TypographyView';
import ColorsView from './ColorsView';
import SpacingView from './SpacingView';
import RadiusView from './RadiusView';
import MessageComponentView from './components/MessageComponentView';
import InfoMessageComponentView from './components/InfoMessageComponentView';
import ActionMessageComponentView from './components/ActionMessageComponentView';
import ActionStatusComponentView from './components/ActionStatusComponentView';
import AgentStatusComponentView from './components/AgentStatusComponentView';
import AgentTimestampComponentView from './components/AgentTimestampComponentView';
import InlineFeedbackComponentView from './components/InlineFeedbackComponentView';
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
import FeedbackComponentView from './components/FeedbackComponentView';
import ConversationFlowPatternView from './patterns/ConversationFlowPatternView';
import HumanHandoffPatternView from './patterns/HumanHandoffPatternView';


const ComponentLibraryView = () => {
  const location = useLocation();
  const { state, setMobileMenuOpen } = useApp();
  const [foundationsExpanded, setFoundationsExpanded] = useState(true);
  const [componentsExpanded, setComponentsExpanded] = useState(true);
  const [patternsExpanded, setPatternsExpanded] = useState(true);
  const prevPathnameRef = useRef(location.pathname);

  const isActive = (path: string) => location.pathname === path;

  // Close mobile menu when navigating to a new page (but not on initial mount)
  useEffect(() => {
    // Only close if pathname actually changed (not on initial mount)
    if (prevPathnameRef.current !== location.pathname) {
      setMobileMenuOpen(false);
      prevPathnameRef.current = location.pathname;
    }
  }, [location.pathname, setMobileMenuOpen]);

  return (
    <div className="flex h-full">
      <Sidebar
        isMobileOpen={state.mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        {/* Foundations */}
        <CollapsibleSection
          title="Foundations"
          expanded={foundationsExpanded}
          onToggle={() => setFoundationsExpanded(!foundationsExpanded)}
        >
          <NavigationGroup className="mb-6">
            {componentNavigation.foundations.map((item) => (
              <NavLink key={item.path} to={item.path} isActive={isActive(item.path)}>
                {item.label}
              </NavLink>
            ))}
          </NavigationGroup>
        </CollapsibleSection>

        {/* Components */}
        <CollapsibleSection
          title="Components"
          expanded={componentsExpanded}
          onToggle={() => setComponentsExpanded(!componentsExpanded)}
        >
          <div className="mb-6">
            {componentNavigation.components.map((category, categoryIndex) => (
              <NavigationGroup
                key={category.label}
                label={category.label}
                className={categoryIndex > 0 ? 'mt-6' : ''}
              >
                {category.items.map((item) => (
                  <NavLink key={item.path} to={item.path} isActive={isActive(item.path)}>
                    {item.label}
                  </NavLink>
                ))}
              </NavigationGroup>
            ))}
          </div>
        </CollapsibleSection>

        {/* Patterns */}
        <CollapsibleSection
          title="Patterns"
          expanded={patternsExpanded}
          onToggle={() => setPatternsExpanded(!patternsExpanded)}
        >
          <NavigationGroup className="mb-6">
            {componentNavigation.patterns.map((item) => (
              <NavLink key={item.path} to={item.path} isActive={isActive(item.path)}>
                {item.label}
              </NavLink>
            ))}
          </NavigationGroup>
        </CollapsibleSection>
      </Sidebar>

      <MainContent>
        <Routes>
          <Route path="conversation-flow" element={<ConversationFlowPatternView />} />
          <Route path="live-agent" element={<HumanHandoffPatternView />} />



          {/* Foundation Routes */}
          <Route path="typography" element={<TypographyView />} />
          <Route path="colors" element={<ColorsView />} />
          <Route path="icons" element={<IconsComponentView />} />
          <Route path="spacing" element={<SpacingView />} />
          <Route path="radius" element={<RadiusView />} />

          {/* Component Routes */}
          <Route index element={<Navigate to="/foundations/typography" replace />} />
          <Route path="message" element={<MessageComponentView />} />
          <Route path="info-message" element={<InfoMessageComponentView />} />
          <Route path="action-message" element={<ActionMessageComponentView />} />
          <Route path="action-status" element={<ActionStatusComponentView />} />
          <Route path="agent-status" element={<AgentStatusComponentView />} />
          <Route path="agent-timestamp" element={<AgentTimestampComponentView />} />
          <Route path="inline-feedback" element={<InlineFeedbackComponentView />} />
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
          <Route path="feedback" element={<FeedbackComponentView />} />
          <Route path="prompt" element={<PromptComponentView />} />
          <Route path="prompt-group" element={<PromptGroupComponentView />} />
        </Routes>
      </MainContent>
    </div>
  );
};

export default ComponentLibraryView;

