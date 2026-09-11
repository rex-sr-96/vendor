'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '@/utils/haptics';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
  menuClassName?: string;
  placeholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  disabled = false,
  className = '',
  containerClassName = '',
  menuClassName = '',
  placeholder = 'Select option',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Normalize options to { value, label }
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Scroll active option into view when opened
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen]);

  const handleSelect = (val: string) => {
    haptics.tap();
    onChange(val);
    setIsOpen(false);
  };

  const isFullWidth = className.includes('w-full');

  return (
    <div
      ref={containerRef}
      className={`relative text-left ${isFullWidth ? 'w-full block' : 'inline-block'} ${containerClassName}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            haptics.tap();
            setIsOpen((prev) => !prev);
          }
        }}
        className={`flex items-center justify-between gap-1.5 transition-all text-left ${
          disabled
            ? 'bg-[#F3F4F4] text-[#5F6368] cursor-not-allowed border-[#E5E7EB]'
            : isOpen
            ? 'border-[#F94001] ring-2 ring-[#F94001]/20 text-[#021526]'
            : 'border-[#E5E7EB] hover:border-[#F94001] text-[#021526]'
        } ${className}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 text-[#5F6368] transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-[#F94001]' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            ref={listRef}
            className={`absolute z-50 mt-1 min-w-[140px] w-full max-h-60 overflow-y-auto bg-white rounded-xl border border-[#E5E7EB] shadow-xl p-1 custom-scrollbar ${menuClassName}`}
          >
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  data-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full px-2.5 py-1.5 text-left text-[12px] rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#F94001] text-white font-extrabold shadow-2xs'
                      : 'text-[#021526] hover:bg-[#F94001]/10 hover:text-[#F94001] font-semibold'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
