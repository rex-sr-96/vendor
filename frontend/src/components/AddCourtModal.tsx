import React, { useEffect } from 'react';
import { X, Layers } from 'lucide-react';
import { AddCourtScreen } from '../screens/AddCourtScreen';

interface AddCourtModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCourtModal: React.FC<AddCourtModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center overflow-y-auto sm:py-6 sm:px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-[#F7F7F5] w-full sm:max-w-2xl rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-[#E8E6E1] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="w-10 h-1 bg-[#D1CFCA] rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 pt-2 pb-3 sm:px-6 sm:py-4 border-b border-[#E8E6E1] bg-white shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[16px] sm:text-[18px] font-black text-[#171717] tracking-tight leading-tight">
                Add New Court / Turf
              </h2>
              <p className="text-[11px] sm:text-[11.5px] font-medium text-[#777570]">
                Configure specs, pricing and cancellation policy
              </p>
            </div>
          </div>
          <button
            id="btn-close-add-court-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#FAF9F6] hover:bg-[#EBE9E3] border border-[#E8E6E1] flex items-center justify-center text-[#777570] hover:text-[#171717] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 overscroll-contain">
          <AddCourtScreen onClose={onClose} />
        </div>
      </div>
    </div>
  );
};
