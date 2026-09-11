import React from 'react';
import { MobileStatusBar } from './MobileStatusBar';
import { MobileHomeIndicator } from './MobileHomeIndicator';

interface MobileDeviceFrameProps {
  deviceType: 'iphone' | 'android' | 'fluid';
  children: React.ReactNode;
  bottomNav?: React.ReactNode;
  overlay?: React.ReactNode;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({
  deviceType,
  children,
  bottomNav,
  overlay,
}) => {
  if (deviceType === 'fluid') {
    return (
      <div className="w-full min-h-screen bg-[#F8F9FA] flex flex-col justify-between max-w-md mx-auto relative shadow-2xl overflow-hidden">
        <MobileStatusBar deviceType="iphone" />
        <div className="flex-1 w-full relative overflow-y-auto no-scrollbar">
          {children}
        </div>
        {bottomNav}
        <MobileHomeIndicator />
        {overlay}
      </div>
    );
  }

  const isIphone = deviceType === 'iphone';

  return (
    <div className="sm:py-6 sm:px-3 min-h-screen flex items-center justify-center bg-[#E5E3DC]">
      {/* Outer Phone Shell Chassis */}
      <div
        className={`relative transition-all duration-300 sm:shadow-[0_25px_70px_rgba(0,0,0,0.35)] w-full max-w-[400px] h-[100dvh] sm:h-[844px] ${
          isIphone
            ? 'bg-[#1E1E20] sm:rounded-[52px] p-0 sm:p-[10px] sm:ring-1 sm:ring-black/40 sm:ring-offset-2 sm:ring-offset-zinc-800'
            : 'bg-[#171719] sm:rounded-[42px] p-0 sm:p-[8px] sm:ring-1 sm:ring-black/30'
        }`}
      >
        {/* Left Side Buttons (Volume Up / Down / Action Button) */}
        {isIphone && (
          <div className="hidden sm:block">
            {/* Action button */}
            <div className="absolute -left-[13px] top-[115px] w-[3px] h-[26px] bg-[#333238] rounded-l-sm" />
            {/* Volume Up */}
            <div className="absolute -left-[13px] top-[155px] w-[3px] h-[48px] bg-[#333238] rounded-l-sm" />
            {/* Volume Down */}
            <div className="absolute -left-[13px] top-[215px] w-[3px] h-[48px] bg-[#333238] rounded-l-sm" />
            {/* Power / Siri Button */}
            <div className="absolute -right-[13px] top-[170px] w-[3px] h-[72px] bg-[#333238] rounded-r-sm" />
          </div>
        )}

        {/* Inner Screen Display */}
        <div
          className={`w-full h-full bg-[#F8F9FA] flex flex-col justify-between overflow-hidden relative ${
            isIphone ? 'sm:rounded-[44px]' : 'sm:rounded-[36px]'
          }`}
        >
          {/* Top Speaker Earpiece Slit (Micro visual) */}
          <div className="hidden sm:block absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#1A1A1A] rounded-full z-50 pointer-events-none" />

          {/* Native Mobile Status Bar */}
          <MobileStatusBar deviceType={isIphone ? 'iphone' : 'android'} />

          {/* Main App Scrollable Content Canvas */}
          <div
            id="mobile-scroll-canvas"
            className="flex-1 w-full overflow-y-auto no-scrollbar relative flex flex-col"
          >
            {children}
          </div>

          {/* Bottom Navigation (if present) */}
          {bottomNav}

          {/* Native Home Gesture Bar */}
          <MobileHomeIndicator />

          {/* In-Frame Overlays (Modals, Bottom Sheets & Toasts strictly inside mobile bounds) */}
          {overlay}
        </div>
      </div>
    </div>
  );
};
