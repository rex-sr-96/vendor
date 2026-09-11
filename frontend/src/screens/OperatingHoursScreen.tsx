import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
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
  CheckCircle2,
  AlertCircle,
  Building2,
  ChevronLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';
import { CustomSelect } from '../components/CustomSelect';

const TIME_OPTIONS = [
  '05:00 AM',
  '05:30 AM',
  '06:00 AM',
  '06:30 AM',
  '07:00 AM',
  '07:30 AM',
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM',
  '07:30 PM',
  '08:00 PM',
  '08:30 PM',
  '09:00 PM',
  '09:30 PM',
  '10:00 PM',
  '10:30 PM',
  '11:00 PM',
  '11:30 PM',
  '12:00 AM',
];

const PRESETS = [
  { label: 'Standard (6 AM – 11 PM)', open: '06:00 AM', close: '11:00 PM', desc: 'Default commercial turf timings' },
  { label: 'Late Night (7 AM – 12 AM)', open: '07:00 AM', close: '12:00 AM', desc: 'Extended late night futsal slots' },
  { label: 'Early Bird (5 AM – 10 PM)', open: '05:00 AM', close: '10:00 PM', desc: 'Early morning academy sessions' },
  { label: 'All Day (5 AM – 12 AM)', open: '05:00 AM', close: '12:00 AM', desc: 'Maximum 19 hours daily availability' },
];

export const OperatingHoursScreen: React.FC = () => {
  const { operatingHours, updateOperatingHours, refreshFromOnboarding, goBack, showToast } = useApp();
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

  const handleApplyPresetToAll = (preset?: (typeof PRESETS)[0]) => {
    haptics.success();
    const open = preset ? preset.open : '06:00 AM';
    const close = preset ? preset.close : '11:00 PM';
    const updated = operatingHours.map((item) => ({
      ...item,
      isOpen: true,
      openTime: open,
      closeTime: close,
    }));
    updateOperatingHours(updated);
    showToast(
      'Weekly Schedule Applied',
      `All 7 days set to ${open} – ${close}`,
      'success'
    );
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
    <div className="pb-20 pt-2 w-full space-y-6 select-none relative">
      {/* Mobile Back Button */}
      <button
        onClick={() => {
          haptics.tap();
          goBack();
        }}
        className="md:hidden flex items-center gap-1.5 text-[12.5px] font-bold text-[#F94001] active-press cursor-pointer pb-1"
      >
        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        <span>Back to Settings</span>
      </button>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]/70">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-black text-[#021526] tracking-tight">Operating Hours</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#16A34A]/10 text-[#16A34A]">
              {openDaysCount}/7 Days Open
            </span>
          </div>
          <p className="text-[12.5px] font-medium text-[#5F6368]">
            Venue operating timetable & slot availability rules
          </p>
        </div>

        <button
          type="button"
          onClick={async () => {
            haptics.tap();
            await refreshFromOnboarding();
            showToast('Operating Hours Synced', 'Schedule synchronized with verified onboarding records.', 'success');
          }}
          className="h-10 px-4 rounded-xl bg-[#021526] hover:bg-[#061D33] text-white font-bold text-[12.5px] flex items-center justify-center gap-2 shadow-xs active-press cursor-pointer transition-colors self-start sm:self-auto"
        >
          <Clock className="w-4 h-4 text-[#F94001]" />
          <span>Sync Onboarding Schedule</span>
        </button>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 7-Day Timetable Schedule List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[13px] font-black text-[#021526] uppercase tracking-wider">
              Weekly Day Schedule
            </span>
            <span className="text-[11.5px] text-[#5F6368] font-medium">Click any day to customize</span>
          </div>

          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xs divide-y divide-[#F3F4F4] overflow-hidden">
            {operatingHours.map((item) => {
              const isToday = item.day === 'Friday'; // 28 Aug 2026 is Friday
              return (
                <div
                  key={item.day}
                  onClick={() => handleOpenEdit(item)}
                  className={`p-4 flex items-center justify-between hover:bg-[#F3F4F4] active-press transition-colors cursor-pointer group ${
                    isToday ? 'bg-[#F94001]/[0.02]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Day Badge */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-bold text-center border ${
                        item.isOpen
                          ? isToday
                            ? 'bg-[#F94001] text-white border-[#F94001] shadow-sm'
                            : 'bg-[#F3F4F4] border-[#E5E7EB] text-[#021526]'
                          : 'bg-[#F3F4F4] border-[#E5E7EB] text-[#5F6368]'
                      }`}
                    >
                      <span className="text-[12px] font-black uppercase tracking-tight leading-none">
                        {item.day.slice(0, 3)}
                      </span>
                    </div>

                    {/* Day Timing Details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[14.5px] font-black text-[#021526]">
                          {item.day}
                        </h3>
                        {isToday && (
                          <span className="px-2 py-0.5 rounded-md bg-[#F94001]/10 text-[#F94001] text-[9.5px] font-black uppercase tracking-wider">
                            Today
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        {item.isOpen ? (
                          <span className="text-[13px] font-semibold text-[#5F6368]">
                            {item.openTime} – {item.closeTime}
                          </span>
                        ) : (
                          <span className="text-[13px] font-semibold text-[#DC2626]">
                            Closed all day
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Status Pill & Chevron */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        item.isOpen
                          ? 'bg-[#16A34A]/10 text-[#15803D]'
                          : 'bg-[#DC2626]/10 text-[#DC2626]'
                      }`}
                    >
                      {item.isOpen ? 'Open' : 'Closed'}
                    </span>

                    <div className="w-7 h-7 rounded-xl bg-[#F3F4F4] group-hover:bg-[#021526] group-hover:text-white transition-colors flex items-center justify-center text-[#5F6368]">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Presets, Breaks & Policies */}
        <div className="lg:col-span-5 space-y-5">
          {/* Quick Schedule Presets */}
          <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-2xs space-y-3">
            <h3 className="text-[14px] font-black text-[#021526] uppercase tracking-wider">
              Quick Schedule Templates
            </h3>
            <p className="text-[12px] text-[#5F6368]">
              Apply standard commercial schedules across all days in one click.
            </p>

            <div className="space-y-2 pt-1">
              {PRESETS.map((preset) => (
                <div
                  key={preset.label}
                  onClick={() => handleApplyPresetToAll(preset)}
                  className="p-3 rounded-2xl bg-[#F3F4F4] hover:bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-between cursor-pointer active-press transition-all group"
                >
                  <div>
                    <p className="text-[13px] font-extrabold text-[#021526] group-hover:text-[#F94001] transition-colors">
                      {preset.label}
                    </p>
                    <p className="text-[11px] text-[#5F6368] mt-0.5">{preset.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#5F6368] group-hover:translate-x-0.5 transition-transform" />
                </div>
              ))}
            </div>
          </div>

          {/* Break & Maintenance Windows */}
          <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-2xs space-y-3">
            <h3 className="text-[14px] font-black text-[#021526] uppercase tracking-wider">
              Maintenance & Special Hours
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  haptics.tap();
                  showToast('Maintenance Slot Set', '1:00 PM – 2:00 PM daily turf rest.', 'success');
                }}
                className="p-3.5 bg-[#F3F4F4] text-[#021526] border border-[#E5E7EB] rounded-2xl flex flex-col items-start gap-1.5 hover:border-[#021526] active-press transition-all cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#021526]">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[13px] font-extrabold text-[#021526] block leading-tight">
                    Daily Turf Rest
                  </span>
                  <span className="text-[11px] text-[#5F6368] block mt-0.5">
                    1:00 PM – 2:00 PM
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  haptics.tap();
                  showToast('Holiday Schedule', 'Public holiday closures configured.', 'info');
                }}
                className="p-3.5 bg-[#F3F4F4] text-[#021526] border border-[#E5E7EB] rounded-2xl flex flex-col items-start gap-1.5 hover:border-[#021526] active-press transition-all cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#5F6368]">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[13px] font-extrabold text-[#021526] block leading-tight">
                    Holiday Blackout
                  </span>
                  <span className="text-[11px] text-[#5F6368] block mt-0.5">
                    Special closure dates
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Operating Hours Modal Dialog (Centered on Desktop) */}
      <AnimatePresence>
        {editingDay && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs">
            <div className="absolute inset-0" onClick={() => setEditingDay(null)} />

            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-h-[90vh] md:max-w-lg md:rounded-[28px] overflow-y-auto no-scrollbar bg-white rounded-t-[28px] p-6 pb-8 shadow-2xl border border-[#E5E7EB] space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F4]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#F94001]/10 text-[#F94001] flex items-center justify-center font-bold text-[14px]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-black text-[#021526] tracking-tight">
                      Edit {editingDay} Hours
                    </h2>
                    <p className="text-[11.5px] text-[#5F6368]">Customize opening and closing time</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingDay(null)}
                  className="w-8 h-8 rounded-full bg-[#F3F4F4] flex items-center justify-center text-[#5F6368] hover:text-[#021526] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveDayHours} className="space-y-4">
                {/* Open / Closed Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F3F4F4] border border-[#E5E7EB]">
                  <div>
                    <p className="text-[13.5px] font-extrabold text-[#021526]">Venue Open on {editingDay}</p>
                    <p className="text-[11px] text-[#5F6368]">Allow online and walk-in slot locking</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setEditIsOpen(!editIsOpen);
                    }}
                    className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                      editIsOpen ? 'bg-[#16A34A]' : 'bg-[#E5E7EB]'
                    }`}
                  >
                    <div
                      className={`w-5.5 h-5.5 rounded-full bg-white shadow-md absolute top-0.75 transition-transform ${
                        editIsOpen ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Time Selectors */}
                {editIsOpen && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11.5px] font-bold text-[#5F6368] block mb-1">
                        Opening Time
                      </label>
                      <CustomSelect
                        value={editOpenTime}
                        onChange={(val) => setEditOpenTime(val)}
                        options={Array.from(new Set([editOpenTime, ...TIME_OPTIONS]))}
                        className="w-full h-11 px-3 rounded-xl bg-[#F3F4F4] border text-[13px] font-extrabold cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-[11.5px] font-bold text-[#5F6368] block mb-1">
                        Closing Time
                      </label>
                      <CustomSelect
                        value={editCloseTime}
                        onChange={(val) => setEditCloseTime(val)}
                        options={Array.from(new Set([editCloseTime, ...TIME_OPTIONS]))}
                        className="w-full h-11 px-3 rounded-xl bg-[#F3F4F4] border text-[13px] font-extrabold cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Apply to All Days Checkbox */}
                <div
                  onClick={() => setApplyToAll(!applyToAll)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F3F4F4] border border-[#E5E7EB] cursor-pointer"
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      applyToAll
                        ? 'bg-[#F94001] border-[#F94001] text-white'
                        : 'border-[#E5E7EB] bg-white'
                    }`}
                  >
                    {applyToAll && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className="text-[12.5px] font-bold text-[#021526]">
                    Apply these hours to all 7 days of the week
                  </span>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-[#F94001] to-[#FF5410] hover:from-[#D93600] hover:to-[#db4a0b] text-white font-extrabold text-[13px] shadow-sm active-press cursor-pointer transition-all"
                >
                  Save Schedule
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
