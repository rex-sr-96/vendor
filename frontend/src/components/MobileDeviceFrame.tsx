'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { MobileStatusBar } from './MobileStatusBar';
import { MobileHomeIndicator } from './MobileHomeIndicator';
import { DesktopSidebar } from './DesktopSidebar';
import { DesktopHeader } from './DesktopHeader';
import {
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

interface MobileDeviceFrameProps {
  deviceType?: 'iphone' | 'android' | 'fluid';
  children: React.ReactNode;
  bottomNav?: React.ReactNode;
  overlay?: React.ReactNode;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({
  children,
  bottomNav,
  overlay,
}) => {
  const { currentScreen, isSidebarCollapsed } = useApp();

  const authScreens = ['splash', 'login', 'otp'];
  const isAuthScreen = authScreens.includes(currentScreen);

  return (
    <div className="min-h-screen w-full bg-[#F6F5F2] text-[#171717] flex flex-col antialiased overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. DESKTOP VIEW (>= 768px): Modern SaaS Sidebar + Content Canvas Layout    */}
      {/* ========================================================================= */}
      <div className="hidden md:flex min-h-screen w-full overflow-x-hidden">
        {isAuthScreen ? (
          /* Modern Focused Desktop Auth Experience - Clean & Distraction-Free Model */
          <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 lg:p-8 bg-[#FAF9F6] relative overflow-hidden">
            {/* Subtle atmospheric ambient glow */}
            <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[640px] h-[340px] bg-gradient-to-b from-[#FF6B2C]/10 via-[#FF6B2C]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-28 right-1/4 w-[420px] h-[280px] bg-[#2FA66A]/7 rounded-full blur-3xl pointer-events-none" />

            {/* Centered Modern Model Card */}
            <div className="w-full max-w-[440px] bg-white rounded-3xl border border-[#E8E6E1]/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06),0_2px_10px_rgba(0,0,0,0.02)] p-8 sm:p-9 relative z-10">
              {children}
            </div>

            {/* Minimalist Trust & Security Footer */}
            <div className="mt-8 text-center text-xs text-[#8E8B85] space-y-1.5 relative z-10">
              <div className="flex items-center justify-center gap-1.5 font-medium text-[#777570]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2FA66A]" />
                <span>256-bit encrypted authentication • TurfTown Arena OS</span>
              </div>
              <p className="text-[11.5px] text-[#A8A59E]">
                © {new Date().getFullYear()} TurfTown Technologies. All rights reserved.
              </p>
            </div>
          </div>
        ) : (
          /* Desktop Dashboard Layout with Modern Collapsible SaaS Sidebar */
          <div className="flex min-h-screen w-full bg-[#F6F5F2] overflow-x-hidden">
            {/* Left SaaS Sidebar */}
            <DesktopSidebar />

            {/* Main Content Area (dynamically adjusts between mini sidebar w-20 and full sidebar w-68) */}
            <div
              className={`flex-1 min-h-screen flex flex-col overflow-x-hidden transition-all duration-300 ease-in-out ${
                isSidebarCollapsed
                  ? 'ml-20 w-[calc(100%-5rem)]'
                  : 'ml-68 w-[calc(100%-17rem)]'
              }`}
            >
              {/* Sticky Top Header */}
              <DesktopHeader />

              {/* Scrollable Page Body with Perfect Responsive Padding */}
              <main className="flex-1 w-full px-5 lg:px-8 py-6 overflow-x-hidden">
                {children}
              </main>
            </div>
          </div>
        )}

        {/* In-App Overlays & Dialogs */}
        {overlay}
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE VIEW (< 768px): Native full-screen mobile app layout             */}
      {/* ========================================================================= */}
      <div className="flex md:hidden flex-col fixed inset-0 w-full h-full bg-[#F6F5F2] overflow-hidden select-none">
        {/* Mobile Native Status Bar */}
        <div className="shrink-0 z-30 bg-[#F6F5F2]">
          <MobileStatusBar deviceType="iphone" />
        </div>

        {/* Scrollable Mobile Canvas */}
        <div
          id="mobile-scroll-canvas"
          className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden no-scrollbar relative flex flex-col touch-scroll"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorY: 'contain',
            touchAction: 'pan-y',
          }}
        >
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        {bottomNav && (
          <div className="shrink-0 z-40 bg-white">
            {bottomNav}
          </div>
        )}

        {/* Mobile Native Home Gesture Bar */}
        <div className="shrink-0 z-30 bg-white">
          <MobileHomeIndicator />
        </div>

        {/* In-Frame Overlays (Modals, Bottom Sheets & Toasts) */}
        {overlay}
      </div>
    </div>
  );
};
