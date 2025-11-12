import { ReactNode } from 'react';

export type PhoneFrameProps = {
  children: ReactNode;
  showStatusBar?: boolean;
  time?: string;
  dimBackground?: boolean;
  className?: string;
};

/**
 * PhoneFrame - Realistic iPhone mockup frame for mobile demos
 * Shows notch, status bar, and wraps content in a phone-shaped container
 */
export const PhoneFrame = ({
  children,
  showStatusBar = true,
  time = '9:41',
  dimBackground = true,
  className,
}: PhoneFrameProps) => {
  return (
    <div className={`relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl ${className || ''}`}>
      {/* Phone notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-10" />
      
      {/* Phone screen - clips content inside. Height: 40px (status bar) + 772px (container) = 812px total */}
      <div className="relative bg-gray-800 rounded-[2.5rem] overflow-hidden h-[812px]">
        {/* Status Bar Area - 40px */}
        <div className="h-[40px] bg-gray-800 relative">
          {showStatusBar && (
            <div className={`absolute inset-0 flex items-center justify-between px-6 text-white text-sm font-medium ${dimBackground ? 'opacity-40' : 'opacity-100'}`}>
              {/* Left side - Time */}
              <div>{time}</div>
              
              {/* Right side - Status icons */}
              <div className="flex items-center gap-1">
                {/* Signal Strength */}
                <svg className="w-4 h-3" viewBox="0 0 16 12" fill="currentColor">
                  <rect x="0" y="8" width="2" height="4" rx="0.5" />
                  <rect x="3" y="6" width="2" height="6" rx="0.5" />
                  <rect x="6" y="4" width="2" height="8" rx="0.5" />
                  <rect x="9" y="2" width="2" height="10" rx="0.5" />
                  <rect x="12" y="0" width="2" height="12" rx="0.5" />
                </svg>
                
                {/* WiFi */}
                <svg className="w-4 h-3" viewBox="0 0 16 12" fill="currentColor">
                  <path d="M8 10.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                  <path fillRule="evenodd" d="M4.5 7a5.5 5.5 0 017 0l-1 1a4 4 0 00-5 0l-1-1z" />
                  <path fillRule="evenodd" d="M1.5 4a9.5 9.5 0 0113 0l-1 1a8 8 0 00-11 0l-1-1z" />
                </svg>
                
                {/* Battery */}
                <svg className="w-6 h-3" viewBox="0 0 24 12" fill="currentColor">
                  <rect x="0" y="1" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1" fill="none" />
                  <rect x="2" y="3" width="14" height="6" rx="1" fill="currentColor" />
                  <rect x="19" y="4" width="2" height="4" rx="1" fill="currentColor" />
                </svg>
              </div>
            </div>
          )}
        </div>
        
        {/* Dimmed background overlay - simulates bottom sheet appearance */}
        {dimBackground && (
          <div className="absolute inset-0 top-[40px] bg-black opacity-40 pointer-events-none z-0" />
        )}
        
        {/* Container content - positioned above dimmed overlay */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};

