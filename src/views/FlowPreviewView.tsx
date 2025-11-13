import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Container, ContainerViewport } from '@/components/vca-components/container';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PhoneFrame } from '@/components/component-library/PhoneFrame';
import { Message } from '@/components/vca-components/messages';
import { PromptGroup } from '@/components/vca-components/prompt-group';
import { AgentStatus } from '@/components/vca-components/agent-status';
import { Divider } from '@/components/vca-components/divider';
import { ThinkingIndicator } from '@/components/vca-components/thinking-indicator';
import { cn } from '@/utils';
import { FlowEngine, type FlowMessage } from '@/utils/flowEngine';

const FlowPreviewView = () => {
  const [viewport, setViewport] = useState<ContainerViewport>('desktop');
  const [selectedFlow, setSelectedFlow] = useState<string>('connect-to-live-agent');
  const [flowMessages, setFlowMessages] = useState<FlowMessage[]>([]);
  const [displayedMessages, setDisplayedMessages] = useState<FlowMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [composerValue, setComposerValue] = useState('');
  const [isFlowActive, setIsFlowActive] = useState(false);
  const flowEngineRef = useRef<FlowEngine>(new FlowEngine());
  const contentRef = useRef<HTMLDivElement>(null);
  const isRevealingRef = useRef(false);
  
  // Expandable section states
  const [adminCenterExpanded, setAdminCenterExpanded] = useState(true);
  const [premiumExpanded, setPremiumExpanded] = useState(true);
  const [recruiterExpanded, setRecruiterExpanded] = useState(true);
  const [salesNavigatorExpanded, setSalesNavigatorExpanded] = useState(true);
  const [generalExpanded, setGeneralExpanded] = useState(true);
  const isActive = (flowId: string) => selectedFlow === flowId;
  
  // Progressive reveal: Show messages one at a time with delays
  const revealMessagesProgressively = async (allMessages: FlowMessage[], startFrom: number = 0) => {
    // Prevent multiple reveals at once
    if (isRevealingRef.current) return;
    isRevealingRef.current = true;
    
    for (let i = startFrom; i < allMessages.length; i++) {
      const message = allMessages[i];
      
      // Show thinking indicator before non-user messages
      if (message.type !== 'user-message') {
        setIsThinking(true);
        // Wait a bit (simulate typing)
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsThinking(false);
      }
      
      // Add this message to displayed messages
      setDisplayedMessages(allMessages.slice(0, i + 1));
      
      // Special timing for agent-status-connecting: wait 2-3 seconds before next message
      if (message.type === 'agent-status-connecting') {
        await new Promise(resolve => setTimeout(resolve, 2500));
      } else if (i < allMessages.length - 1) {
        // Small pause before next message (except for last message)
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    isRevealingRef.current = false;
  };
  
  // Load flow when selected flow changes
  useEffect(() => {
    // Reset all state when switching flows
    setIsThinking(false);
    setHasInteracted(false);
    setComposerValue('');
    setIsFlowActive(false);
    isRevealingRef.current = false;
    
    // Initialize with welcome messages
    const initialMessages: FlowMessage[] = [
      {
        stepId: 'welcome-1',
        type: 'ai-message',
        text: 'Hi there. With the help of AI, I can answer questions about Premium products or connect you to our team.',
      },
      {
        stepId: 'welcome-2',
        type: 'ai-message',
        text: 'Not sure where to start? You can try:',
        buttons: [
          { label: 'Is LinkedIn Premium right for me?', nextStep: '' },
          { label: 'How can LinkedIn Premium help me reach my goals?', nextStep: '' },
          { label: 'I need help with something on LinkedIn Premium', nextStep: '' },
        ],
      },
    ];
    
    setFlowMessages([]);
    setDisplayedMessages(initialMessages);
  }, [selectedFlow]);
  
  // Reveal new messages when flowMessages changes
  useEffect(() => {
    if (flowMessages.length > displayedMessages.length) {
      revealMessagesProgressively(flowMessages, displayedMessages.length);
    }
  }, [flowMessages, displayedMessages.length]);
  
  // Auto-scroll to bottom when displayed messages change
  useEffect(() => {
    if (contentRef.current) {
      // Scroll to the very bottom of the content area
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [displayedMessages, isThinking]);
  
  // Handle button click in flow
  const handleFlowButtonClick = (buttonLabel: string) => {
    // Mark that user has interacted with the flow
    setHasInteracted(true);
    
    // Progress the flow (messages will be revealed progressively)
    flowEngineRef.current.handleButtonClick(buttonLabel);
    setFlowMessages([...flowEngineRef.current.getMessages()]);
  };
  
  // Handle restart button click
  const handleRestart = () => {
    setHasInteracted(false);
    setIsThinking(false);
    setComposerValue('');
    setIsFlowActive(false);
    isRevealingRef.current = false;
    setFlowMessages([]);
    
    // Reset to welcome messages
    const initialMessages: FlowMessage[] = [
      {
        stepId: 'welcome-1',
        type: 'ai-message',
        text: 'Hi there. With the help of AI, I can answer questions about Premium products or connect you to our team.',
      },
      {
        stepId: 'welcome-2',
        type: 'ai-message',
        text: 'Not sure where to start? You can try:',
        buttons: [
          { label: 'Is LinkedIn Premium right for me?', nextStep: '' },
          { label: 'How can LinkedIn Premium help me reach my goals?', nextStep: '' },
          { label: 'I need help with something on LinkedIn Premium', nextStep: '' },
        ],
      },
    ];
    setDisplayedMessages(initialMessages);
  };
  
  // Detect if message is asking for human agent
  const detectAgentIntent = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    const agentKeywords = ['agent', 'human', 'person', 'someone', 'live chat', 'live agent', 'speak to', 'talk to', 'connect me', 'representative', 'support person', 'real person'];
    return agentKeywords.some(keyword => lowerMessage.includes(keyword));
  };
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!composerValue.trim() || isRevealingRef.current) return;
    
    const userMessage = composerValue.trim();
    setComposerValue('');
    setHasInteracted(true);
    
    // Add user message to chat
    const newUserMessage: FlowMessage = {
      stepId: `user-${Date.now()}`,
      type: 'user-message',
      text: userMessage,
    };
    
    setDisplayedMessages(prev => [...prev, newUserMessage]);
    
    // Auto-scroll after user message
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = contentRef.current.scrollHeight;
      }
    }, 100);
    
    // Check if asking for agent
    if (detectAgentIntent(userMessage) && !isFlowActive) {
      setIsFlowActive(true);
      
      // Wait a moment, then start showing connecting status
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show disclaimer first
      const disclaimerMsg: FlowMessage = {
        stepId: 'disclaimer',
        type: 'disclaimer',
        text: '',
      };
      setDisplayedMessages(prev => [...prev, disclaimerMsg]);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Auto-scroll
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      }, 100);
      
      // Show connecting status
      const connectingMsg: FlowMessage = {
        stepId: 'connecting',
        type: 'agent-status-connecting',
        text: "You're next in line",
        description: "A member of our team will join the chat soon.",
      };
      setDisplayedMessages(prev => [...prev, connectingMsg]);
      
      // Auto-scroll
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      }, 100);
      
      // Wait for connection (2.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Show connected status
      const connectedMsg: FlowMessage = {
        stepId: 'connected',
        type: 'agent-status-connected',
        text: "Sarah has joined the chat",
        agentName: "Sarah, LinkedIn Support",
      };
      setDisplayedMessages(prev => [...prev, connectedMsg]);
      
      // Auto-scroll
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      }, 100);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show agent's first message
      const agentMsg: FlowMessage = {
        stepId: 'agent-message',
        type: 'human-agent-message',
        text: "Hi! I'm Sarah, how can I help you today?",
        agentName: "Sarah, LinkedIn Support",
        timestamp: "2:34 PM",
      };
      setDisplayedMessages(prev => [...prev, agentMsg]);
      
      // Auto-scroll
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      }, 100);
    } else if (!isFlowActive) {
      // Generic AI response for non-agent queries
      setIsThinking(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsThinking(false);
      
      const aiResponse: FlowMessage = {
        stepId: `ai-${Date.now()}`,
        type: 'ai-message',
        text: "I understand you have a question. I'm here to help with Premium products. If you'd like to speak with a live agent, just let me know!",
      };
      
      setDisplayedMessages(prev => [...prev, aiResponse]);
    }
    
    // Auto-scroll after AI response
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = contentRef.current.scrollHeight;
      }
    }, 100);
  };
  
  // Render flow messages
  const renderChatContent = () => {
    // Separate disclaimers from other messages - disclaimers go first
    const disclaimers = displayedMessages.filter(msg => msg.type === 'disclaimer');
    let otherMessages = displayedMessages.filter(msg => msg.type !== 'disclaimer');
    
    // If agent is connected, hide the connecting message (only show minimal connected state)
    const hasConnectedMessage = otherMessages.some(msg => msg.type === 'agent-status-connected');
    if (hasConnectedMessage) {
      otherMessages = otherMessages.filter(msg => msg.type !== 'agent-status-connecting');
    }
    
    return (
      <>
        <div className="flex flex-col gap-vca-lg px-vca-lg">
          {/* Render disclaimers first (above all other messages) */}
          {disclaimers.map((_msg, index) => (
            <Message key={`disclaimer-${index}`} type="disclaimer" />
          ))}
          
          {/* Then render all other messages */}
          {otherMessages.map((msg, index) => {
            // Render different message types
            if (msg.type === 'ai-message') {
              return (
                <div key={index} className="flex flex-col gap-vca-s">
                  <Message type="ai" defaultText={msg.text} />
                  {msg.buttons && msg.buttons.length > 0 && (
                    <PromptGroup 
                      prompts={msg.buttons.map(btn => ({
                        text: btn.label,
                        showAiIcon: false,
                        onClick: () => handleFlowButtonClick(btn.label)
                      }))}
                    />
                  )}
                </div>
              );
            }
            
            if (msg.type === 'user-message') {
              return <Message key={index} type="user" userText={msg.text} />;
            }
            
            if (msg.type === 'human-agent-message') {
              return (
                <Message 
                  key={index} 
                  type="human-agent" 
                  humanAgentText={msg.text}
                  showTimestamp={true}
                  agentTimestampText={msg.agentName && msg.timestamp ? `${msg.agentName}  ${msg.timestamp}` : undefined}
                />
              );
            }
            
            if (msg.type === 'agent-status-connecting') {
              return (
                <AgentStatus 
                  key={index} 
                  state="connecting"
                  statusLabel={msg.text}
                  description={msg.description}
                  showDescription={true}
                  showAction={true}
                  actionLabel="Cancel"
                />
              );
            }
            
            if (msg.type === 'agent-status-connected') {
              // Extract first name from agentName (e.g., "Sarah, LinkedIn Support" -> "Sarah")
              const firstName = msg.agentName?.split(',')[0] || 'Agent';
              return (
                <div key={index} className="flex flex-col gap-vca-lg">
                  {/* Divider appears just above connected status */}
                  <Divider text="LIVE CHAT" />
                  <AgentStatus 
                    state="success"
                    agentName={firstName}
                  />
                </div>
              );
            }
            
            if (msg.type === 'agent-status') {
              return <AgentStatus key={index} statusLabel={msg.text} />;
            }
            
            return null;
          })}
          
          {/* Show thinking indicator when AI is processing */}
          {isThinking && (
            <div className="flex items-start gap-vca-s">
              <ThinkingIndicator />
            </div>
          )}
        </div>
      </>
    );
  };
  
  return (
    <div className="flex h-full">
      <Sidebar>
        {/* General - First section */}
        <button
          onClick={() => setGeneralExpanded(!generalExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-4 cursor-pointer hover:text-gray-700 transition-colors w-full"
        >
          <span>General</span>
          <svg
            className={cn("w-3 h-3 transition-transform", generalExpanded ? "rotate-0" : "-rotate-90")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {generalExpanded && (
          <div className="space-y-0.5 mb-6">
            <button
              onClick={() => setSelectedFlow('connect-to-live-agent')}
              className={cn(
                "block text-left px-3 py-2 text-2xs rounded transition-colors w-full",
                isActive('connect-to-live-agent')
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              Connect to live agent
            </button>
          </div>
        )}

        {/* Admin Center */}
        <button
          onClick={() => setAdminCenterExpanded(!adminCenterExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-4 cursor-pointer hover:text-gray-700 transition-colors w-full"
        >
          <span>Admin Center</span>
          <svg
            className={cn("w-3 h-3 transition-transform", adminCenterExpanded ? "rotate-0" : "-rotate-90")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {adminCenterExpanded && (
          <>
            {/* Account Management */}
            <div className="space-y-0.5 mb-6">
              <div className="text-xs font-normal text-gray-500 mb-2">Account Management</div>
              <button
                onClick={() => setSelectedFlow('add-user')}
                className={cn(
                  "block text-left px-3 py-2 text-2xs rounded transition-colors w-full",
                  isActive('add-user')
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                Add User
              </button>
              <button
                onClick={() => setSelectedFlow('remove-user')}
                className={cn(
                  "block text-left px-3 py-2 text-2xs rounded transition-colors w-full",
                  isActive('remove-user')
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                Remove User
              </button>
              <button
                onClick={() => setSelectedFlow('update-user-role')}
                className={cn(
                  "block text-left px-3 py-2 text-2xs rounded transition-colors w-full",
                  isActive('update-user-role')
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                Update User Role
              </button>
            </div>

            {/* Subscription & Billing */}
            <div className="space-y-0.5 mb-6">
              <div className="text-xs font-normal text-gray-500 mb-2">Subscription & Billing</div>
              <button
                onClick={() => setSelectedFlow('cancel-subscription')}
                className={cn(
                  "block text-left px-3 py-2 text-2xs rounded transition-colors w-full",
                  isActive('cancel-subscription')
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                Cancel Subscription
              </button>
              <button
                onClick={() => setSelectedFlow('check-subscription')}
                className={cn(
                  "block text-left px-3 py-2 text-2xs rounded transition-colors w-full",
                  isActive('check-subscription')
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                Check Subscription
              </button>
              <button
                onClick={() => setSelectedFlow('upgrade-plan')}
                className={cn(
                  "block text-left px-3 py-2 text-2xs rounded transition-colors w-full",
                  isActive('upgrade-plan')
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                Upgrade Plan
              </button>
            </div>
          </>
        )}

        {/* Premium */}
        <button
          onClick={() => setPremiumExpanded(!premiumExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-4 cursor-pointer hover:text-gray-700 transition-colors w-full"
        >
          <span>Premium</span>
          <svg
            className={cn("w-3 h-3 transition-transform", premiumExpanded ? "rotate-0" : "-rotate-90")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {premiumExpanded && (
          <div className="space-y-0.5 mb-6">
            <div className="text-xs font-normal text-gray-500 italic">No flows yet</div>
          </div>
        )}

        {/* Recruiter */}
        <button
          onClick={() => setRecruiterExpanded(!recruiterExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-4 cursor-pointer hover:text-gray-700 transition-colors w-full"
        >
          <span>Recruiter</span>
          <svg
            className={cn("w-3 h-3 transition-transform", recruiterExpanded ? "rotate-0" : "-rotate-90")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {recruiterExpanded && (
          <div className="space-y-0.5 mb-6">
            <div className="text-xs font-normal text-gray-500 italic">No flows yet</div>
          </div>
        )}

        {/* Sales Navigator */}
        <button
          onClick={() => setSalesNavigatorExpanded(!salesNavigatorExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-4 cursor-pointer hover:text-gray-700 transition-colors w-full"
        >
          <span>Sales Navigator</span>
          <svg
            className={cn("w-3 h-3 transition-transform", salesNavigatorExpanded ? "rotate-0" : "-rotate-90")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {salesNavigatorExpanded && (
          <div className="space-y-0.5 mb-6">
            <div className="text-xs font-normal text-gray-500 italic">No flows yet</div>
          </div>
        )}
      </Sidebar>

      <div 
        className="flex-1 h-full relative bg-stone-50"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0, 0, 0, 0.08) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {/* Viewport Toggle */}
        <div className="absolute top-4 left-4 z-10">
          <Tabs value={viewport} onValueChange={(value) => setViewport(value as ContainerViewport)}>
            <TabsList>
              <TabsTrigger value="desktop" className="px-3">
                {/* Desktop Icon */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="8" y1="21" x2="16" y2="21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="17" x2="12" y2="21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </TabsTrigger>
              <TabsTrigger value="mobile" className="px-3">
                {/* Mobile Icon */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="18" x2="12" y2="18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Chat panel - centered for mobile, bottom-right for desktop */}
        {viewport === 'mobile' ? (
          // Mobile: Centered in main content area with 85% scale (phone only)
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              {/* Restart button - only show after first interaction (full size) */}
              {hasInteracted && selectedFlow === 'connect-to-live-agent' && (
                <Button onClick={handleRestart} variant="outline" size="sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Restart
                </Button>
              )}
              
              {/* Phone frame scaled to 85% */}
              <div className="scale-[0.85] origin-top">
                <PhoneFrame showStatusBar={true} dimBackground={true}>
                  <Container 
                    headerTitle="Help"
                    viewport={viewport}
                    contentRef={contentRef}
                    composerValue={composerValue}
                    onComposerChange={setComposerValue}
                    onComposerSend={handleSendMessage}
                  >
                    {renderChatContent()}
                  </Container>
                </PhoneFrame>
              </div>
            </div>
          </div>
        ) : (
          // Desktop: Bottom-right corner
          <div className="absolute bottom-4 right-4 flex flex-col items-center gap-3">
            {/* Restart button - only show after first interaction */}
            {hasInteracted && selectedFlow === 'connect-to-live-agent' && (
              <Button onClick={handleRestart} variant="outline" size="sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Restart
              </Button>
            )}
            
            <Container 
              headerTitle="Help"
              viewport={viewport}
              contentRef={contentRef}
              composerValue={composerValue}
              onComposerChange={setComposerValue}
              onComposerSend={handleSendMessage}
            >
              {renderChatContent()}
            </Container>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowPreviewView;

