import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="pointer-events-auto bg-[#171717] text-white rounded-2xl p-3.5 shadow-xl flex items-start gap-3 border border-white/10 backdrop-blur-md"
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#2FA66A]" />}
              {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-[#E7A72F]" />}
              {toast.type === 'error' && <XCircle className="w-4 h-4 text-[#D94B4B]" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-[#4D83C4]" />}
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-[13px] font-semibold tracking-tight text-white leading-tight">
                {toast.title}
              </p>
              {toast.description && (
                <p className="text-[12px] text-[#A3A099] mt-0.5 leading-snug">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-[#777570] hover:text-white p-1 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
