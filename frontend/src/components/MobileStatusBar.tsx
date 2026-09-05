import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Sparkles, Activity, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

interface MobileStatusBarProps {
  deviceType?: 'iphone' | 'android';
}

export const MobileStatusBar: React.FC<MobileStatusBarProps> = ({ deviceType = 'iphone' }) => {
  const [time, setTime] = useState<string>('09:41');
  const [batteryLevel] = useState<number>(92);
  const [isIslandExpanded, setIsIslandExpanded] = useState<boolean>(false);
  const { currentScreen, selectedBooking } = useApp();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full relative z-40 select-none bg-transparent pt-2.5 pb-1 px-6 flex items-center justify-between text-[#171717]">
      {/* Left: Live Clock */}
      <div className="flex items-center gap-1.5 w-20">
        <span className="text-[14px] font-bold tracking-tight font-sans text-[#171717] leading-none">
          {time}
        </span>
      </div>

      {/* Center: Dynamic Island / Camera Notch */}
      {deviceType === 'iphone' ? (
        <div className="relative flex justify-center">
          <motion.div
            layout
            onClick={() => setIsIslandExpanded(!isIslandExpanded)}
            className={`bg-[#111111] text-white rounded-full flex items-center justify-between px-3 cursor-pointer shadow-md transition-all ${
              isIslandExpanded
                ? 'w-72 h-9 py-1.5 bg-black'
                : 'w-28 h-6.5 py-1'
            }`}
          >
            {!isIslandExpanded ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2FA66A] animate-pulse" />
                  <span className="text-[10px] font-bold text-white/90">Live Turf 1</span>
                </div>
                {/* Camera lens hole */}
                <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] ring-1 ring-white/10" />
              </>
            ) : (
              <div className="w-full flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#FF6B2C] flex items-center justify-center text-[10px] font-extrabold text-white">
                    TT
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-white leading-tight">Turf 1 · 7v7 Football</p>
                    <p className="text-[9px] text-white/60">Rahul Kumar · 28 min left</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#2FA66A] bg-[#2FA66A]/20 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A]" />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        /* Android Punch Hole */
        <div className="w-3.5 h-3.5 rounded-full bg-[#111111] ring-1 ring-black/10 mx-auto" />
      )}

      {/* Right: Cellular, Wi-Fi, Battery */}
      <div className="flex items-center justify-end gap-1.5 w-20 text-[#171717]">
        {/* Cellular Bars */}
        <div className="flex items-end gap-0.5 h-3">
          <div className="w-0.5 h-1.5 bg-[#171717] rounded-xs" />
          <div className="w-0.5 h-2 bg-[#171717] rounded-xs" />
          <div className="w-0.5 h-2.5 bg-[#171717] rounded-xs" />
          <div className="w-0.5 h-3 bg-[#171717] rounded-xs" />
        </div>

        {/* 5G Text */}
        <span className="text-[10px] font-extrabold text-[#171717] tracking-tighter">5G</span>

        {/* Wi-Fi */}
        <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />

        {/* Battery Container */}
        <div className="relative flex items-center">
          <div className="w-5 h-2.5 rounded-[4px] border border-[#171717] p-0.5 flex items-center">
            <div
              className="h-full rounded-[2px] bg-[#171717]"
              style={{ width: `${batteryLevel}%` }}
            />
          </div>
          <div className="w-0.5 h-1 bg-[#171717] rounded-r-xs -ml-px" />
        </div>
      </div>
    </div>
  );
};
