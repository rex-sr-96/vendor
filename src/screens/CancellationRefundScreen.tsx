import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  RotateCcw,
  Clock,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

export const CancellationRefundScreen: React.FC = () => {
  const { cancellationPolicy, updateCancellationPolicy, goBack } = useApp();

  const [freeHours, setFreeHours] = useState<number>(cancellationPolicy.freeCancellationHours);
  const [refundPercent, setRefundPercent] = useState<number>(cancellationPolicy.refundPercentage);
  const [autoReleaseMins, setAutoReleaseMins] = useState<number>(
    cancellationPolicy.autoReleaseHoldMinutes
  );

  const handleSave = () => {
    haptics.success();
    updateCancellationPolicy({
      freeCancellationHours: freeHours,
      refundPercentage: refundPercent,
      autoReleaseHoldMinutes: autoReleaseMins,
    });
    goBack();
  };

  return (
    <div className="pb-8 pt-3 px-4 w-full space-y-3.5 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              haptics.tap();
              goBack();
            }}
            className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-[#021526] hover:bg-[#E5E7EB]/50 active-press transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.4]" />
          </button>
          <div>
            <h1 className="text-[17px] font-extrabold text-[#021526] tracking-tight leading-none">
              Cancellation & Refunds
            </h1>
            <span className="text-[11px] text-[#5F6368] mt-0.5 block">
              Slot release & customer refund policies
            </span>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1 text-[11.5px] font-bold text-white bg-[#021526] px-3 py-1.5 rounded-xl hover:bg-black active-press cursor-pointer shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save</span>
        </button>
      </div>

      {/* Free Cancellation Window */}
      <div className="bg-white rounded-2xl p-3.5 border border-[#E5E7EB] shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[#F3F4F4]">
          <div className="w-8 h-8 rounded-xl bg-[#F94001]/10 text-[#F94001] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[13.5px] font-bold text-[#021526]">Free Cancellation Window</h2>
            <p className="text-[11px] text-[#5F6368]">
              Minimum notice required for full/partial refund
            </p>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold text-[#5F6368] block mb-1.5">
            Notice before slot match time:
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {[2, 4, 12, 24].map((hours) => (
              <button
                key={hours}
                type="button"
                onClick={() => {
                  haptics.tap();
                  setFreeHours(hours);
                }}
                className={`py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                  freeHours === hours
                    ? 'bg-[#FFF1EC] text-[#F94001] border border-[#F94001]/40 shadow-2xs font-bold'
                    : 'bg-[#F3F4F4] text-[#021526] hover:bg-[#E5E7EB]'
                }`}
              >
                {hours} Hours
              </button>
            ))}
          </div>
        </div>

        <div className="pt-1">
          <div className="flex items-center justify-between text-[12.5px] mb-1">
            <span className="font-bold text-[#021526]">Refund amount during free window</span>
            <span className="font-extrabold text-[#16A34A]">{refundPercent}%</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[100, 80, 50].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => {
                  haptics.tap();
                  setRefundPercent(pct);
                }}
                className={`py-1.5 rounded-xl text-[11.5px] font-bold transition-all cursor-pointer ${
                  refundPercent === pct
                    ? 'bg-[#16A34A] text-white shadow-xs'
                    : 'bg-[#F3F4F4] text-[#021526] hover:bg-[#E5E7EB]'
                }`}
              >
                {pct}% Refund
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-Release Hold Timer */}
      <div className="bg-white rounded-2xl p-3.5 border border-[#E5E7EB] shadow-xs space-y-2.5">
        <div className="flex items-center gap-2 pb-2 border-b border-[#F3F4F4]">
          <div className="w-8 h-8 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[13.5px] font-bold text-[#021526]">Unpaid Hold Release</h2>
            <p className="text-[11px] text-[#5F6368]">
              Auto-release slot back to public if customer doesn't pay
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {[10, 15, 30, 45].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => {
                haptics.tap();
                setAutoReleaseMins(mins);
              }}
              className={`py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                autoReleaseMins === mins
                  ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/40 shadow-2xs font-bold'
                  : 'bg-[#F3F4F4] text-[#021526] hover:bg-[#E5E7EB]'
              }`}
            >
              {mins} Mins
            </button>
          ))}
        </div>
      </div>

      {/* Save Button bottom CTA */}
      <div className="pt-1">
        <button
          onClick={handleSave}
          className="w-full h-11 bg-[#021526] hover:bg-black text-white font-bold rounded-2xl text-[13.5px] flex items-center justify-center gap-2 active-press transition-all shadow-xs cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          <span>Apply Cancellation Policies</span>
        </button>
      </div>
    </div>
  );
};
