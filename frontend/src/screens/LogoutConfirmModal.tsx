import React from 'react';
import { useApp } from '@/context/AppContext';
import { LogOut, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '@/utils/haptics';

export const LogoutConfirmModal: React.FC = () => {
  const { activeModal, setActiveModal, navigateTo, ownerName, ownerPhone, venueName, showToast } = useApp();

  if (activeModal !== 'logout_confirm') return null;

  const handleCancel = () => {
    haptics.tap();
    setActiveModal(null);
  };

  const handleConfirmLogout = () => {
    haptics.tap();
    setActiveModal(null);
    navigateTo('login');
    showToast('Signed Out', 'You have been safely signed out.', 'info');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0" onClick={handleCancel} />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 8 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#E8E6E1] space-y-4"
        >
          {/* Top Close Button */}
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#FAF9F6] hover:bg-[#F1F0EC] border border-[#E8E6E1] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Icon & Title */}
          <div className="flex flex-col items-center text-center space-y-2 pt-1">
            <div className="w-14 h-14 rounded-2xl bg-[#D94B4B]/10 border border-[#D94B4B]/20 text-[#D94B4B] flex items-center justify-center shadow-xs">
              <LogOut className="w-6 h-6 ml-0.5" />
            </div>
            <div>
              <h3 className="text-[18px] font-black text-[#171717] tracking-tight">
                Confirm Sign Out?
              </h3>
              <p className="text-[12px] text-[#777570] mt-1 leading-snug">
                Are you sure you want to sign out of <strong className="text-[#171717]">{venueName}</strong>?
              </p>
            </div>
          </div>

          {/* User Account Info Chip */}
          <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-[#E8E6E1] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#171717] text-white flex items-center justify-center font-black text-[12px] shrink-0">
              TT
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[12.5px] font-black text-[#171717] leading-none truncate">
                {ownerName}
              </p>
              <p className="text-[11px] text-[#777570] mt-1 font-mono truncate">
                {ownerPhone} · Arena Director
              </p>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="flex items-center gap-2 text-[11px] text-[#2FA66A] bg-[#2FA66A]/10 border border-[#2FA66A]/20 px-3 py-2 rounded-xl">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Active match timers and booked slots will continue uninterrupted.</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleCancel}
              className="h-11 rounded-xl bg-[#FAF9F6] hover:bg-[#F1F0EC] border border-[#E8E6E1] text-[#171717] font-bold text-[12.5px] active-press cursor-pointer transition-colors"
            >
              Stay Logged In
            </button>
            <button
              type="button"
              onClick={handleConfirmLogout}
              className="h-11 rounded-xl bg-[#D94B4B] hover:bg-[#c03939] text-white font-black text-[12.5px] flex items-center justify-center gap-1.5 shadow-xs active-press cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
