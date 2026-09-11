import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  Save,
  Percent,
  Timer,
  CheckCircle2,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

export const CancellationRefundScreen: React.FC<{ isEmbedded?: boolean }> = ({ isEmbedded = false }) => {
  const {
    courts,
    updateCourt,
    cancellationPolicy,
    updateCancellationPolicy,
    goBack,
    showToast,
  } = useApp();

  const approvedCourts = useMemo(
    () => courts.filter((c) => c.status === 'Approved' || !c.status),
    [courts]
  );

  // Selected court
  const [selectedCourtId, setSelectedCourtId] = useState<string>(
    approvedCourts[0]?.id || 'court-1'
  );

  const currentCourt =
    approvedCourts.find((c) => c.id === selectedCourtId) || approvedCourts[0] || courts[0];

  // Form states per court
  const [freeHours, setFreeHours] = useState<number>(12);
  const [refundPercent, setRefundPercent] = useState<number>(100);
  const [autoReleaseMins, setAutoReleaseMins] = useState<number>(15);
  const [applyToAll, setApplyToAll] = useState<boolean>(false);

  // Load selected court's current policy
  useEffect(() => {
    if (currentCourt) {
      setFreeHours(currentCourt.cancellationWindowHours ?? 12);
      setRefundPercent(currentCourt.refundPercentage ?? 100);
      setAutoReleaseMins(cancellationPolicy.autoReleaseHoldMinutes || 15);
    }
  }, [currentCourt, cancellationPolicy.autoReleaseHoldMinutes]);

  const handleSave = () => {
    haptics.success();

    const policyLabel = `Free cancel up to ${freeHours}h before match (${refundPercent}% refund)`;

    if (applyToAll) {
      // Update all courts
      approvedCourts.forEach((c) => {
        updateCourt(c.id, {
          cancellationWindowHours: freeHours,
          refundPercentage: refundPercent,
          cancellationPolicyLabel: policyLabel,
        });
      });
      updateCancellationPolicy({
        freeCancellationHours: freeHours,
        refundPercentage: refundPercent,
        autoReleaseHoldMinutes: autoReleaseMins,
      });
      showToast('All Courts Updated', `Cancellation & refund policy applied to all ${approvedCourts.length} courts.`, 'success');
    } else {
      // Update specific court
      updateCourt(currentCourt.id, {
        cancellationWindowHours: freeHours,
        refundPercentage: refundPercent,
        cancellationPolicyLabel: policyLabel,
      });
      updateCancellationPolicy({
        autoReleaseHoldMinutes: autoReleaseMins,
      });
      showToast('Court Policy Updated', `${currentCourt.name} cancellation rule: ${freeHours}h notice, ${refundPercent}% refund.`, 'success');
    }

    if (!isEmbedded) {
      goBack();
    }
  };

  return (
    <div className={isEmbedded ? 'w-full space-y-4 select-none' : 'pb-20 pt-1 w-full space-y-4 select-none'}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-[21px] font-black text-[#021526] tracking-tight">
            Cancellation & Refund Policy
          </h1>
          <p className="text-[11.5px] font-medium text-[#5F6368]">
            Configure court-specific cancellation buffer, refund percentages and cart hold timers
          </p>
        </div>

        <button
          onClick={handleSave}
          className="h-9 px-4 rounded-xl bg-[#F94001] hover:bg-[#D93600] text-white font-extrabold text-[12.5px] flex items-center justify-center gap-1.5 shadow-sm active-press cursor-pointer transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4 stroke-[2.5]" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Court Selector Bar */}
      <div className="bg-white rounded-2xl p-3.5 border border-[#E5E7EB] shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-[#F3F4F4]">
          <span className="text-[12px] font-black uppercase tracking-wider text-[#021526] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#F94001]" />
            <span>Select Court to Configure ({approvedCourts.length} Courts)</span>
          </span>

          <label className="flex items-center gap-2 cursor-pointer text-[11.5px] font-bold text-[#021526]">
            <input
              type="checkbox"
              checked={applyToAll}
              onChange={(e) => setApplyToAll(e.target.checked)}
              className="rounded text-[#F94001] focus:ring-[#F94001] cursor-pointer"
            />
            <span>Apply rule to all courts</span>
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {approvedCourts.map((court) => {
            const isSelected = selectedCourtId === court.id;
            return (
              <button
                key={court.id}
                type="button"
                onClick={() => {
                  haptics.tap();
                  setSelectedCourtId(court.id);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFF1EC] text-[#021526] border-2 border-[#F94001] shadow-2xs'
                    : 'bg-[#F3F4F4] border-[#E5E7EB] text-[#021526] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-black">{court.name}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#F94001] shadow-2xs" />}
                </div>
                <p className={`text-[10.5px] mt-0.5 truncate ${isSelected ? 'text-[#021526]/70 font-semibold' : 'text-[#5F6368]'}`}>
                  {court.sports.join(', ')} · {court.cancellationWindowHours || 12}h cancel
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Column Responsive Layout matching User Screenshots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Free Cancellation Window */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-2xs space-y-3">
          <div className="flex items-center gap-3 pb-1 border-b border-[#F3F4F4]">
            <div className="w-10 h-10 rounded-2xl bg-[#F94001]/10 text-[#F94001] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[15px] font-black text-[#021526]">Free Cancellation Window</h2>
              <p className="text-[11.5px] text-[#5F6368] font-medium">
                Minimum notice required for full or partial refund
              </p>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold text-[#021526] block mb-2">
              Notice Buffer Before Match Kickoff:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 4, 12, 24].map((hours) => {
                const isSelected = freeHours === hours;
                return (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setFreeHours(hours);
                    }}
                    className={`py-2.5 rounded-xl text-[13px] font-black transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFF1EC] text-[#F94001] border border-[#F94001]/40 shadow-2xs'
                        : 'bg-[#F3F4F4] border border-[#E5E7EB] text-[#021526] hover:bg-white'
                    }`}
                  >
                    {hours} Hours
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 2: Unconfirmed Cart Hold Release */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-2xs space-y-3">
          <div className="flex items-center gap-3 pb-1 border-b border-[#F3F4F4]">
            <div className="w-10 h-10 rounded-2xl bg-[#3B82F6]/10 text-[#2563EB] flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[15px] font-black text-[#021526]">Unconfirmed Cart Hold Release</h2>
              <p className="text-[11.5px] text-[#5F6368] font-medium">
                Auto-release locked slots if player leaves checkout
              </p>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold text-[#021526] block mb-2">
              Lock Expiry Timer:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map((mins) => {
                const isSelected = autoReleaseMins === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setAutoReleaseMins(mins);
                    }}
                    className={`py-2.5 rounded-xl text-[13px] font-black transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/40 shadow-2xs'
                        : 'bg-[#F3F4F4] border border-[#E5E7EB] text-[#021526] hover:bg-white'
                    }`}
                  >
                    {mins} Minutes
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 3: Refund Payout Percentage */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-2xs space-y-3">
          <div className="flex items-center gap-3 pb-1 border-b border-[#F3F4F4]">
            <div className="w-10 h-10 rounded-2xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[15px] font-black text-[#021526]">Refund Payout Percentage</h2>
              <p className="text-[11.5px] text-[#5F6368] font-medium">
                Amount returned to customer source account
              </p>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold text-[#021526] block mb-2">
              Eligible Refund Value:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[50, 75, 90, 100].map((pct) => {
                const isSelected = refundPercent === pct;
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setRefundPercent(pct);
                    }}
                    className={`py-2.5 rounded-xl text-[13px] font-black transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-[#16A34A] text-white border-[#16A34A] shadow-xs'
                        : 'bg-[#F3F4F4] border border-[#E5E7EB] text-[#021526] hover:bg-[#F3F4F4]'
                    }`}
                  >
                    {pct}%
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 4: Customer Notice Preview */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-[#F3F4F4]">
            <h3 className="text-[12.5px] font-black text-[#021526] uppercase tracking-wider">
              CUSTOMER NOTICE PREVIEW ({applyToAll ? 'All Courts' : currentCourt.name})
            </h3>
            <span className="text-[10px] font-bold text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-full">
              Live Policy
            </span>
          </div>

          <div className="bg-[#F3F4F4] p-3 rounded-xl border border-[#E5E7EB] text-[12px] text-[#5F6368] leading-relaxed">
            Players canceling at least <strong className="text-[#021526]">{freeHours} hours</strong> before
            the booked match for <strong className="text-[#021526]">{applyToAll ? 'any court' : currentCourt.name}</strong> receive a{' '}
            <strong className="text-[#16A34A]">{refundPercent}% refund</strong> to their original UPI/Bank payment method. Cart slots are automatically unlocked after{' '}
            <strong className="text-[#F94001]">{autoReleaseMins} minutes</strong> of inactivity.
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#5F6368]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
            <span>Policy syncs across app checkout, ground badges, and owner edit forms.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
