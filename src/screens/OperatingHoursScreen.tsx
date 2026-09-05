import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  Clock,
  ChevronRight,
  Coffee,
  Moon,
  Check,
  X,
  Sparkles,
  Zap,
  Calendar,
  Layers,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';

const TIME_OPTIONS = [
  '05:00 AM',
  '06:00 AM',
  '07:00 AM',
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
  '08:00 PM',
  '09:00 PM',
  '10:00 PM',
  '11:00 PM',
  '12:00 AM',
];

const PRESETS = [
  { label: 'Standard (6 AM – 11 PM)', open: '06:00 AM', close: '11:00 PM' },
  { label: 'Late Night (7 AM – 12 AM)', open: '07:00 AM', close: '12:00 AM' },
  { label: 'Early Bird (5 AM – 10 PM)', open: '05:00 AM', close: '10:00 PM' },
  { label: 'All Day (5 AM – 12 AM)', open: '05:00 AM', close: '12:00 AM' },
];

export const OperatingHoursScreen: React.FC = () => {
  const { operatingHours, updateOperatingHours, goBack, showToast } = useApp();
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editOpenTime, setEditOpenTime] = useState<string>('06:00 AM');
  const [editCloseTime, setEditCloseTime] = useState<string>('11:00 PM');
  const [editIsOpen, setEditIsOpen] = useState<boolean>(true);
  const [applyToAll, setApplyToAll] = useState<boolean>(false);

  const openDaysCount = operatingHours.filter((d) => d.isOpen).length;

  const handleOpenEdit = (dayItem: (typeof operatingHours)[0]) => {
    haptics.tap();
    setEditingDay(dayItem.day);
    setEditOpenTime(dayItem.openTime);
    setEditCloseTime(dayItem.closeTime);
    setEditIsOpen(dayItem.isOpen);
    setApplyToAll(false);
  };

  const handleApplyPresetToAll = () => {
    haptics.success();
    const updated = operatingHours.map((item) => ({
      ...item,
      isOpen: true,
      openTime: '06:00 AM',
      closeTime: '11:00 PM',
    }));
    updateOperatingHours(updated);
    showToast('Weekly Schedule Applied', 'All 7 days set to 06:00 AM – 11:00 PM', 'success');
  };

  const handleSaveDayHours = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDay) return;
    haptics.success();

    let updated = operatingHours;
    if (applyToAll) {
      updated = operatingHours.map((item) => ({
        ...item,
        isOpen: editIsOpen,
        openTime: editOpenTime,
        closeTime: editCloseTime,
      }));
      showToast(
        'Updated All 7 Days',
        `Schedule set to ${editOpenTime} – ${editCloseTime} across the week.`,
        'success'
      );
    } else {
      updated = operatingHours.map((item) =>
        item.day === editingDay
          ? {
              ...item,
              isOpen: editIsOpen,
              openTime: editOpenTime,
              closeTime: editCloseTime,
            }
          : item
      );
      showToast(
        'Operating Hours Saved',
        `${editingDay} timings updated (${editIsOpen ? `${editOpenTime} – ${editCloseTime}` : 'Closed'}).`,
        'success'
      );
    }

    updateOperatingHours(updated);
    setEditingDay(null);
  };

  return (
    <div className="pb-8 pt-3 px-4 w-full space-y-3.5 select-none relative">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              haptics.tap();
              goBack();
            }}
            className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-[#171717] hover:bg-[#E8E6E1]/50 active-press transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.4]" />
          </button>
          <div>
            <h1 className="text-[19px] font-extrabold text-[#171717] tracking-tight leading-none">
              Operating Hours
            </h1>
            <p className="text-[11px] text-[#777570] mt-0.5 font-medium">
              Venue schedule & court slot availability
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2FA66A]/10 border border-[#2FA66A]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2FA66A]" />
          <span className="text-[11px] font-bold text-[#1E774A]">
            {openDaysCount}/7 Days Open
          </span>
        </div>
      </div>

      {/* Quick Action Bar for Uniform Weekly Hours */}
      <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-[#E8E6E1] flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white border border-[#E8E6E1] flex items-center justify-center text-[#FF6B2C]">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[12px] font-bold text-[#171717] block leading-tight">
              Uniform Weekly Hours
            </span>
            <span className="text-[10px] text-[#777570]">
              Quickly sync 06:00 AM – 11:00 PM
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleApplyPresetToAll}
          className="text-[11px] font-bold bg-[#171717] hover:bg-[#2A2A2A] text-white px-3 py-1.5 rounded-xl active-press shadow-2xs transition-colors cursor-pointer"
        >
          Apply to All
        </button>
      </div>

      {/* Weekly Schedule List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[12px] font-extrabold text-[#171717] tracking-tight">
            Daily Court Availability
          </span>
          <span className="text-[10.5px] text-[#777570] font-medium">
            Tap day to edit timings
          </span>
        </div>

        <div className="bg-white rounded-[22px] border border-[#E8E6E1] shadow-xs divide-y divide-[#F1F0EC] overflow-hidden">
          {operatingHours.map((item) => {
            const isToday = item.day === 'Friday'; // 28 Aug 2026 is Friday
            return (
              <div
                key={item.day}
                onClick={() => handleOpenEdit(item)}
                className={`p-3.5 flex items-center justify-between hover:bg-[#F7F7F5] active-press transition-colors cursor-pointer group ${
                  isToday ? 'bg-[#FF6B2C]/[0.02]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Day Badge */}
                  <div
                    className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-bold text-center border ${
                      item.isOpen
                        ? isToday
                          ? 'bg-[#FF6B2C] text-white border-[#FF6B2C]'
                          : 'bg-[#FAF9F6] border-[#E8E6E1] text-[#171717]'
                        : 'bg-[#F1F0EC] border-[#E8E6E1] text-[#A3A099]'
                    }`}
                  >
                    <span className="text-[11px] uppercase tracking-tight leading-none">
                      {item.day.slice(0, 3)}
                    </span>
                  </div>

                  {/* Day Timing Details */}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-[13.5px] font-extrabold text-[#171717]">
                        {item.day}
                      </h3>
                      {isToday && (
                        <span className="px-1.5 py-0.2 rounded-md bg-[#FF6B2C]/10 text-[#FF6B2C] text-[9px] font-black uppercase">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      {item.isOpen ? (
                        <span className="text-[12px] font-semibold text-[#55534E]">
                          {item.openTime} – {item.closeTime}
                        </span>
                      ) : (
                        <span className="text-[12px] font-semibold text-[#D94B4B]">
                          Closed all day
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Status Pill & Chevron (Clean direct card tap) */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md ${
                      item.isOpen
                        ? 'bg-[#2FA66A]/10 text-[#1E774A]'
                        : 'bg-[#D94B4B]/10 text-[#D94B4B]'
                    }`}
                  >
                    {item.isOpen ? 'Open' : 'Closed'}
                  </span>

                  <div className="w-6 h-6 rounded-lg bg-[#FAF9F6] group-hover:bg-[#171717] group-hover:text-white transition-colors flex items-center justify-center text-[#777570]">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Break & Maintenance Windows */}
      <div className="space-y-2 pt-1">
        <span className="text-[12px] font-extrabold text-[#171717] tracking-tight px-1 block">
          Break & Maintenance Windows
        </span>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              haptics.tap();
              showToast(
                'Pitch Maintenance Slot Added',
                '01:00 PM – 02:00 PM set for daily pitch rest.',
                'success'
              );
            }}
            className="p-3 bg-white text-[#171717] border border-[#E8E6E1] rounded-2xl flex flex-col items-start gap-1.5 hover:border-[#171717] active-press transition-all cursor-pointer shadow-2xs text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-[#FAF9F6] border border-[#E8E6E1] flex items-center justify-center text-[#171717]">
              <Coffee className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[12.5px] font-bold text-[#171717] block leading-tight">
                Daily Rest Break
              </span>
              <span className="text-[10.5px] text-[#777570] block mt-0.5">
                1:00 PM – 2:00 PM
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              haptics.tap();
              showToast(
                'Holiday Schedule',
                'Public holiday closures configured for calendar.',
                'info'
              );
            }}
            className="p-3 bg-white text-[#171717] border border-[#E8E6E1] rounded-2xl flex flex-col items-start gap-1.5 hover:border-[#171717] active-press transition-all cursor-pointer shadow-2xs text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-[#FAF9F6] border border-[#E8E6E1] flex items-center justify-center text-[#777570]">
              <Moon className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[12.5px] font-bold text-[#171717] block leading-tight">
                Public Holiday
              </span>
              <span className="text-[10.5px] text-[#777570] block mt-0.5">
                Special closure dates
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Edit Operating Hours Modal Sheet */}
      <AnimatePresence>
        {editingDay && (
          <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs">
            <div
              className="absolute inset-0"
              onClick={() => setEditingDay(null)}
            />

            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-h-[90vh] overflow-y-auto no-scrollbar bg-white rounded-t-[28px] p-5 pb-8 shadow-2xl border-t border-[#E8E6E1] space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F0EC]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center font-bold text-[13px]">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-extrabold text-[#171717] tracking-tight">
                      Edit {editingDay} Timings
                    </h2>
                    <p className="text-[11.5px] text-[#777570] font-medium">
                      Set open/close timings or mark closed
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    setEditingDay(null);
                  }}
                  className="w-8 h-8 rounded-full bg-[#F1F0EC] flex items-center justify-center text-[#777570] hover:text-[#171717] active-press cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveDayHours} className="space-y-3.5">
                {/* Open / Closed Toggle Segment */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1]">
                  <div>
                    <span className="text-[13px] font-extrabold text-[#171717] block">
                      Arena Open on {editingDay}?
                    </span>
                    <span className="text-[11px] text-[#777570]">
                      {editIsOpen ? 'Slots available for player bookings' : 'Marked fully closed'}
                    </span>
                  </div>

                  <div className="flex gap-1 bg-[#EBE9E3] p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        setEditIsOpen(true);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                        editIsOpen
                          ? 'bg-[#171717] text-white shadow-xs'
                          : 'text-[#777570] hover:text-[#171717]'
                      }`}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        setEditIsOpen(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                        !editIsOpen
                          ? 'bg-[#D94B4B] text-white shadow-xs'
                          : 'text-[#777570] hover:text-[#171717]'
                      }`}
                    >
                      Closed
                    </button>
                  </div>
                </div>

                {editIsOpen && (
                  <>
                    {/* Time Selectors */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-[#777570] block mb-1">
                          OPENING TIME
                        </label>
                        <select
                          value={editOpenTime}
                          onChange={(e) => setEditOpenTime(e.target.value)}
                          className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2.5 text-[13px] font-bold text-[#171717] focus:outline-none focus:border-[#FF6B2C]"
                        >
                          {TIME_OPTIONS.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-[#777570] block mb-1">
                          CLOSING TIME
                        </label>
                        <select
                          value={editCloseTime}
                          onChange={(e) => setEditCloseTime(e.target.value)}
                          className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2.5 text-[13px] font-bold text-[#171717] focus:outline-none focus:border-[#FF6B2C]"
                        >
                          {TIME_OPTIONS.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quick Timing Presets */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-[#777570]">
                        Quick Shift Presets
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {PRESETS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              haptics.tap();
                              setEditOpenTime(preset.open);
                              setEditCloseTime(preset.close);
                            }}
                            className={`p-2 rounded-xl text-left border text-[11px] font-semibold transition-all cursor-pointer ${
                              editOpenTime === preset.open && editCloseTime === preset.close
                                ? 'bg-[#FF6B2C]/10 border-[#FF6B2C] text-[#FF6B2C]'
                                : 'bg-[#FAF9F6] border-[#E8E6E1] text-[#777570] hover:text-[#171717]'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Apply to All Days Checkbox */}
                <div
                  onClick={() => {
                    haptics.tap();
                    setApplyToAll(!applyToAll);
                  }}
                  className="p-3 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E1] flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        applyToAll
                          ? 'bg-[#171717] border-[#171717] text-white'
                          : 'bg-white border-[#D1CFCA]'
                      }`}
                    >
                      {applyToAll && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="text-[12.5px] font-bold text-[#171717] block leading-tight">
                        Apply to all 7 days
                      </span>
                      <span className="text-[10.5px] text-[#777570]">
                        Sync entire weekly schedule with this timing
                      </span>
                    </div>
                  </div>
                </div>

                {/* Save CTA */}
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingDay(null)}
                    className="flex-1 h-12 bg-[#F1F0EC] text-[#777570] font-bold text-[13px] rounded-2xl active-press transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-[2] h-12 bg-[#FF6B2C] text-white font-bold text-[13px] rounded-2xl shadow-md active-press hover:bg-[#e85b1e] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Operating Hours</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
