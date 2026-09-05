import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Wrench,
  Sparkles,
  Zap,
  CheckCircle2,
  Calendar,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';

export const BlockSlotSheet: React.FC = () => {
  const { activeModal, setActiveModal, courts, blockSlotAction } = useApp();

  const [courtId, setCourtId] = useState(courts[0]?.id || 'court-1');
  const [courtName, setCourtName] = useState(courts[0]?.name || 'Turf 1');
  const [date, setDate] = useState('Today, 28 Aug 2026');
  const [fromTime, setFromTime] = useState('9:00 AM');
  const [duration, setDuration] = useState<'1hr' | '2hrs' | 'half_day'>('2hrs');
  const [selectedMaintenanceType, setSelectedMaintenanceType] = useState('infill');
  const [notes, setNotes] = useState('Turf Infill Maintenance & Net Replacement');

  if (activeModal !== 'block_slot') return null;

  const maintenanceOptions = [
    {
      id: 'infill',
      title: 'Turf Infill Maintenance & Brushing',
      desc: 'Rubber granule replenishment & de-compaction brushing',
      defaultDuration: '2hrs',
    },
    {
      id: 'netting',
      title: 'Goalpost, Netting & Line Repair',
      desc: 'Perimeter net tensioning, line remarking & hardware fix',
      defaultDuration: '1hr',
    },
    {
      id: 'lighting',
      title: 'Floodlight & Electrical Servicing',
      desc: 'LED floodlight bulb swap & cabling inspection',
      defaultDuration: '1hr',
    },
    {
      id: 'drainage',
      title: 'Sprinkler & Pitch Deep Clean',
      desc: 'High-pressure turf vacuuming & drainage flushing',
      defaultDuration: '2hrs',
    },
  ];

  const handleCourtChange = (cId: string) => {
    setCourtId(cId);
    const matched = courts.find((c) => c.id === cId);
    if (matched) setCourtName(matched.name);
  };

  const handleSelectMaintenance = (opt: (typeof maintenanceOptions)[0]) => {
    haptics.tap();
    setSelectedMaintenanceType(opt.id);
    setNotes(opt.title);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    haptics.success();

    const timeLabel =
      duration === '2hrs'
        ? `${fromTime.split(':')[0]}–${parseInt(fromTime.split(':')[0], 10) + 2} ${fromTime.includes('PM') ? 'PM' : 'AM'}`
        : duration === 'half_day'
        ? `${fromTime.split(':')[0]}–${parseInt(fromTime.split(':')[0], 10) + 4} ${fromTime.includes('PM') ? 'PM' : 'AM'}`
        : `${fromTime.split(':')[0]}–${parseInt(fromTime.split(':')[0], 10) + 1} ${fromTime.includes('PM') ? 'PM' : 'AM'}`;

    const reason =
      maintenanceOptions.find((m) => m.id === selectedMaintenanceType)?.title ||
      'Turf Pitch Maintenance';

    blockSlotAction(courtId, courtName, timeLabel, reason, 'maintenance', notes);
    setActiveModal(null);
  };

  const handleClose = () => {
    haptics.tap();
    setActiveModal(null);
  };

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="w-full max-h-[92vh] overflow-y-auto no-scrollbar bg-white rounded-t-[32px] p-5 pb-8 shadow-2xl border-t border-[#E8E6E1]"
        >
          {/* iOS Grab Handle */}
          <div className="w-10 h-1 bg-[#D1CFCA] rounded-full mx-auto mb-3" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F0EC]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#F0EFEA] border border-[#D6D3C9] flex items-center justify-center text-[#2B2A28]">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-[17px] font-black text-[#171717] tracking-tight leading-tight">
                  Pitch Maintenance Block
                </h2>
                <p className="text-[11px] text-[#777570] font-medium">
                  Block court slots for turf upkeep & servicing
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-[#F1F0EC] flex items-center justify-center text-[#777570] hover:text-[#171717] active-press cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="py-3 space-y-3.5">
            {/* Court Selection */}
            <div>
              <label className="block text-[11.5px] font-bold text-[#171717] mb-1">
                Select Court / Turf
              </label>
              <div className="bg-[#F7F7F5] border border-[#E8E6E1] rounded-[14px] px-3.5 py-2">
                <select
                  value={courtId}
                  onChange={(e) => handleCourtChange(e.target.value)}
                  className="w-full text-[13px] font-bold text-[#171717] bg-transparent focus:outline-none cursor-pointer"
                >
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.sports.join(', ')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Maintenance Type Options (Only Maintenance as requested) */}
            <div>
              <label className="block text-[11.5px] font-bold text-[#171717] mb-1.5">
                Maintenance Category
              </label>
              <div className="space-y-2">
                {maintenanceOptions.map((opt) => {
                  const isSelected = selectedMaintenanceType === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectMaintenance(opt)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer active-press flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#F0EFEA] border-[#171717] shadow-xs'
                          : 'bg-[#F7F7F5] border-[#E8E6E1] hover:border-[#171717]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#171717] text-white'
                              : 'bg-white text-[#615E58] border border-[#E8E6E1]'
                          }`}
                        >
                          <Wrench className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="text-[12.5px] font-bold text-[#171717] leading-tight">
                            {opt.title}
                          </h4>
                          <p className="text-[10px] text-[#777570] leading-tight mt-0.5">
                            {opt.desc}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#171717] shrink-0 stroke-[2.5]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timing & Continuous Duration Selector */}
            <div className="bg-[#F7F7F5] border border-[#E8E6E1] rounded-2xl p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#171717] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#FF6B2C]" />
                  Schedule & Duration
                </span>
                <span className="text-[10px] text-[#777570] font-semibold">{date}</span>
              </div>

              {/* Start Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10.5px] font-bold text-[#777570] mb-1">
                    Start Time
                  </label>
                  <select
                    value={fromTime}
                    onChange={(e) => setFromTime(e.target.value)}
                    className="w-full bg-white border border-[#E8E6E1] rounded-xl px-2.5 py-1.5 text-[12px] font-bold text-[#171717]"
                  >
                    <option value="6:00 AM">6:00 AM</option>
                    <option value="7:00 AM">7:00 AM</option>
                    <option value="8:00 AM">8:00 AM</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                    <option value="5:00 PM">5:00 PM</option>
                    <option value="6:00 PM">6:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-[#777570] mb-1">
                    Continuous Block Duration
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setDuration('1hr')}
                      className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        duration === '1hr'
                          ? 'bg-[#171717] text-white shadow-2xs'
                          : 'bg-white text-[#777570] border border-[#E8E6E1]'
                      }`}
                    >
                      1 Hr
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuration('2hrs')}
                      className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        duration === '2hrs'
                          ? 'bg-[#171717] text-white shadow-2xs'
                          : 'bg-white text-[#777570] border border-[#E8E6E1]'
                      }`}
                    >
                      2 Hrs (Cont.)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuration('half_day')}
                      className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        duration === 'half_day'
                          ? 'bg-[#171717] text-white shadow-2xs'
                          : 'bg-white text-[#777570] border border-[#E8E6E1]'
                      }`}
                    >
                      4 Hrs
                    </button>
                  </div>
                </div>
              </div>

              {duration === '2hrs' && (
                <div className="p-2 rounded-xl bg-[#F0EFEA] border border-[#D6D3C9] flex items-center gap-1.5 text-[11px] font-bold text-[#2B2A28]">
                  <Wrench className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Will block 2 continuous consecutive hourly slots for maintenance.
                  </span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11.5px] font-bold text-[#171717] mb-1">
                Maintenance Notes / Work Order
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Scheduled grooming machine pass & net swap"
                className="w-full bg-[#F7F7F5] border border-[#E8E6E1] rounded-[14px] px-3.5 py-2 text-[12px] font-medium text-[#171717] focus:outline-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-1">
              <button
                type="submit"
                id="btn-confirm-maintenance-block"
                className="w-full h-11 bg-[#171717] hover:bg-black text-white font-bold text-[13px] rounded-xl flex items-center justify-center gap-1.5 shadow-xs active-press cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>Confirm Pitch Maintenance Block</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
