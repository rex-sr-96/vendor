import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  Zap,
  ShowerHead,
  Droplets,
  Car,
  Shirt,
  Trophy,
  HeartPulse,
  Users,
  Coffee,
  Wifi,
  ShieldCheck,
  BatteryCharging,
  Sparkles,
  SunMedium,
  DoorOpen,
  Armchair,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

export const AmenitiesScreen: React.FC = () => {
  const { amenities, toggleAmenity, goBack } = useApp();
  const [filter, setFilter] = useState<string>('all');

  const activeCount = amenities.filter((a) => a.enabled).length;

  const filteredAmenities = amenities.filter((a) => {
    if (filter === 'all') return true;
    return a.category.toLowerCase() === filter.toLowerCase();
  });

  const getAmenityIcon = (iconName: string) => {
    switch (iconName) {
      case 'SunMedium':
      case 'Zap':
        return <SunMedium className="w-4 h-4 text-[#F94001]" />;
      case 'DoorOpen':
      case 'ShowerHead':
        return <DoorOpen className="w-4 h-4 text-[#16A34A]" />;
      case 'Droplets':
        return <Droplets className="w-4 h-4 text-[#3B82F6]" />;
      case 'Car':
        return <Car className="w-4 h-4 text-[#8B5CF6]" />;
      case 'Shirt':
        return <Shirt className="w-4 h-4 text-[#EC4899]" />;
      case 'Trophy':
        return <Trophy className="w-4 h-4 text-[#F59E0B]" />;
      case 'HeartPulse':
        return <HeartPulse className="w-4 h-4 text-[#EF4444]" />;
      case 'Coffee':
        return <Coffee className="w-4 h-4 text-[#F59E0B]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-[#6366F1]" />;
      case 'Armchair':
        return <Armchair className="w-4 h-4 text-[#EC4899]" />;
      case 'Users':
        return <Users className="w-4 h-4 text-[#10B981]" />;
      case 'Wifi':
        return <Wifi className="w-4 h-4 text-[#06B6D4]" />;
      case 'BatteryCharging':
        return <BatteryCharging className="w-4 h-4 text-[#84CC16]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#F94001]" />;
    }
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
            className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-[#021526] hover:bg-[#E5E7EB]/50 active-press transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.4]" />
          </button>
          <div>
            <h1 className="text-[17px] font-extrabold text-[#021526] tracking-tight leading-none">
              Venue Amenities
            </h1>
            <span className="text-[11px] text-[#5F6368] mt-0.5 block">
              {activeCount} of {amenities.length} active on player app
            </span>
          </div>
        </div>
      </div>

      {/* Summary Highlight Box */}
      <div className="bg-white rounded-2xl p-3.5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-[#5F6368] uppercase tracking-wider block">
            Public Venue Highlights
          </span>
          <p className="text-[12.5px] text-[#021526] font-bold mt-0.5">
            Shown to players before booking slots
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-[#16A34A]/10 text-[#15803D]">
            {activeCount} Visible
          </span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {[
          { id: 'all', label: 'All Amenities' },
          { id: 'Lighting', label: 'Lighting' },
          { id: 'Facility', label: 'Facilities' },
          { id: 'Refreshment', label: 'Refreshments' },
          { id: 'Safety', label: 'Safety & First Aid' },
          { id: 'Equipment', label: 'Equipment' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              haptics.tap();
              setFilter(tab.id as any);
            }}
            className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              filter === tab.id
                ? 'bg-[#021526] text-white shadow-xs'
                : 'bg-white text-[#5F6368] border border-[#E5E7EB] hover:text-[#021526]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Amenities Toggle List */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs divide-y divide-[#F3F4F4] overflow-hidden">
        {filteredAmenities.map((amenity) => (
          <div
            key={amenity.id}
            onClick={() => {
              haptics.tap();
              toggleAmenity(amenity.id);
            }}
            className="p-3.5 flex items-center justify-between hover:bg-[#F3F4F4] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 pr-3">
              <div className="w-8 h-8 rounded-xl bg-[#F3F4F4] flex items-center justify-center shrink-0">
                {getAmenityIcon(amenity.iconName)}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-[13px] font-bold text-[#021526]">{amenity.name}</h3>
                {amenity.price > 0 ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#F59E0B]/15 text-[#B87C0D]">
                    ₹{amenity.price}/rental
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#16A34A]/10 text-[#15803D]">
                    Free
                  </span>
                )}
              </div>
            </div>

            {/* Custom Mobile Toggle Switch */}
            <div
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                amenity.enabled ? 'bg-[#F94001]' : 'bg-[#E5E7EB]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                  amenity.enabled ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
