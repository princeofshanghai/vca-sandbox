import { ReactNode } from 'react';
import { cn } from '@/utils';

export type PhoneFrameProps = {
  children: ReactNode;
  showStatusBar?: boolean;
  time?: string;
  dimBackground?: boolean;
  className?: string;
};

/**
 * PhoneFrame - Mobile Sheet Presentation Wrapper
 * Simulates a mobile device environment with a dimmed background and status bar,
 * but without the heavy hardware frame (bezels/buttons).
 */
export const PhoneFrame = ({
  children,
  showStatusBar = true,
  time = '9:41',
  dimBackground: _dimBackground = true, // Kept for API compatibility, but effectively unused as the frame ITSELF is the dimmed bg
  className,
}: PhoneFrameProps) => {
  return (
    <div className={cn(
      "relative inline-flex flex-col items-center",
      "p-0 overflow-hidden",
      "bg-[#666666]", // Light Gray / Dimmed background (matches screenshot vibe)
      "rounded-[50px]",
      "shadow-2xl",
      className
    )}>

      {/* Status Bar Area (Fixed Height) - Black Text/Icons for Light Dimmed Background */}
      {/* Status Bar Area (Fixed Height) - Black Text/Icons for Light Dimmed Background */}
      <div className="h-[54px] w-full shrink-0 relative flex justify-between items-center px-8 pt-3 pb-1 z-20">
        {showStatusBar && (
          <>
            {/* Time */}
            <div className="text-[17px] font-semibold text-black tracking-tight w-[80px] text-center">{time}</div>

            {/* Center Space (Empty) */}
            <div className="flex-1"></div>

            {/* Status Icons - Black */}
            <div className="flex items-center gap-2 justify-end w-[80px]">
              {/* Signal */}
              <svg width="24" height="16" viewBox="0 0 18 12" fill="none" className="text-black">
                <path d="M10 3C10 2.44772 10.4477 2 11 2H12C12.5523 2 13 2.44772 13 3V11C13 11.5523 12.5523 12 12 12H11C10.4477 12 10 11.5523 10 11V3Z" fill="currentColor" />
                <path d="M15 1C15 0.447715 15.4477 0 16 0H17C17.5523 0 18 0.447715 18 1V11C18 11.5523 17.5523 12 17 12H16C15.4477 12 15 11.5523 15 11V1Z" fill="currentColor" />
                <path d="M5 6.5C5 5.94772 5.44772 5.5 6 5.5H7C7.55228 5.5 8 5.94772 8 6.5V11C8 11.5523 7.55228 12 7 12H6C5.44772 12 5 11.5523 5 11V6.5Z" fill="currentColor" />
                <path d="M0 9C0 8.44772 0.447715 8 1 8H2C2.55228 8 3 8.44772 3 9V11C3 11.5523 2.55228 12 2 12H1C0.447715 12 0 11.5523 0 11V9Z" fill="currentColor" />
              </svg>

              {/* Wifi */}
              <svg width="22" height="15" viewBox="0 0 17 12" fill="none" className="text-black">
                <path fillRule="evenodd" clipRule="evenodd" d="M8.50047 2.58753C10.967 2.58764 13.3393 3.55505 15.1269 5.28982C15.2615 5.42375 15.4766 5.42206 15.6092 5.28603L16.896 3.96045C16.9631 3.89146 17.0006 3.798 17 3.70076C16.9994 3.60353 16.9609 3.51052 16.893 3.44234C12.2011 -1.14745 4.79908 -1.14745 0.107163 3.44234C0.0391973 3.51047 0.000634479 3.60345 7.75932e-06 3.70069C-0.00061896 3.79792 0.0367421 3.89141 0.103824 3.96045L1.39096 5.28603C1.52346 5.42226 1.73878 5.42396 1.87331 5.28982C3.66116 3.55494 6.03367 2.58752 8.50047 2.58753ZM8.53591 6.58938C9.89112 6.58929 11.198 7.10346 12.2025 8.03199C12.3384 8.16376 12.5524 8.16091 12.6849 8.02555L13.9702 6.69997C14.0379 6.63044 14.0754 6.53611 14.0744 6.4381C14.0735 6.34008 14.034 6.24656 13.965 6.17844C10.9059 3.27385 6.16853 3.27385 3.10945 6.17844C3.04035 6.24656 3.00092 6.34013 3.00002 6.43817C2.99911 6.53622 3.0368 6.63054 3.10462 6.69997L4.38954 8.02555C4.52199 8.16091 4.73602 8.16376 4.87189 8.03199C5.87578 7.10408 7.18159 6.58995 8.53591 6.58938ZM11.1496 9.17672C11.1515 9.27501 11.1137 9.36977 11.0449 9.43863L8.82165 11.7289C8.75648 11.7962 8.66762 11.834 8.57491 11.834C8.4822 11.834 8.39334 11.7962 8.32817 11.7289L6.10452 9.43863C6.03583 9.36972 5.99804 9.27492 6.00008 9.17663C6.00212 9.07834 6.0438 8.98527 6.11528 8.91938C7.53515 7.69354 9.61467 7.69354 11.0345 8.91938C11.106 8.98532 11.1476 9.07843 11.1496 9.17672Z" fill="currentColor" />
              </svg>

              {/* Battery */}
              <svg width="35" height="16" viewBox="0 0 28 13" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black">
                <path opacity="0.35" d="M4 0.5H21C22.933 0.5 24.5 2.067 24.5 4V9C24.5 10.933 22.933 12.5 21 12.5H4C2.067 12.5 0.5 10.933 0.5 9V4C0.5 2.067 2.067 0.5 4 0.5Z" stroke="currentColor" />
                <path opacity="0.4" d="M26 5V9.22034C26.8491 8.86291 27.4012 8.0314 27.4012 7.11017C27.4012 6.18894 26.8491 5.35744 26 5Z" fill="currentColor" />
                <path d="M2 4C2 2.89543 2.89543 2 4 2H21C22.1046 2 23 2.89543 23 4V9C23 10.1046 22.1046 11 21 11H4C2.89543 11 2 10.1046 2 9V4Z" fill="currentColor" />
              </svg>
            </div>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full">
        {children}
      </div>

      {/* Bottom Safe Area Spacer - White background to merge with Content */}
      <div className="h-[28px] w-full shrink-0 relative flex justify-center pt-2 bg-white">
        {/* Home Indicator - Dark Gray */}
        <div className="w-[134px] h-[5px] bg-[#1A1A1A] rounded-full"></div>
      </div>

    </div>
  );
};
