import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
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
  Check,
  ChevronLeft,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

export const AmenitiesScreen: React.FC = () => {
  const { amenities, toggleAmenity, goBack, showToast } = useApp();
  const [filter, setFilter] = useState<'all' | 'facilities' | 'equipment' | 'comfort' | 'safety'>('all');

  const activeCount = amenities.filter((a) => a.enabled).length;

  const categories = [
    { id: 'all', label: 'All Amenities' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'equipment', label: 'Equipment & Gear' },
    { id: 'comfort', label: 'Comfort & Lounge' },
    { id: 'safety', label: 'Safety & First Aid' },
  ];

  const filteredAmenities = amenities.filter((a) => {
    if (filter === 'all') return true;
    return a.category === filter;
  });

  const getAmenityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-5 h-5 text-[#FF6B2C]" />;
      case 'ShowerHead':
        return <ShowerHead className="w-5 h-5 text-[#2FA66A]" />;
      case 'Droplets':
        return <Droplets className="w-5 h-5 text-[#3B82F6]" />;
      case 'Car':
        return <Car className="w-5 h-5 text-[#8B5CF6]" />;
      case 'Shirt':
        return <Shirt className="w-5 h-5 text-[#EC4899]" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-[#E7A72F]" />;
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-[#EF4444]" />;
      case 'Users':
        return <Users className="w-5 h-5 text-[#10B981]" />;
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-[#F59E0B]" />;
      case 'Wifi':
        return <Wifi className="w-5 h-5 text-[#06B6D4]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-[#6366F1]" />;
      case 'BatteryCharging':
        return <BatteryCharging className="w-5 h-5 text-[#84CC16]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#FF6B2C]" />;
    }
  };

  return (
    <div className="pb-20 pt-2 w-full space-y-6 select-none relative">
      {/* Mobile Back Button */}
      <button
        onClick={() => {
          haptics.tap();
          goBack();
        }}
        className="md:hidden flex items-center gap-1.5 text-[12.5px] font-bold text-[#FF6B2C] active-press cursor-pointer pb-1"
      >
        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        <span>Back to Settings</span>
      </button>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E6E1]/70">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-black text-[#171717] tracking-tight">Venue Amenities</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#2FA66A]/10 text-[#2FA66A]">
              {activeCount} of {amenities.length} Active on App
            </span>
          </div>
          <p className="text-[12.5px] font-medium text-[#777570]">
            Select which facility amenities are highlighted to players during online booking
          </p>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => {
          const isSelected = filter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                haptics.tap();
                setFilter(cat.id as any);
              }}
              className={`px-3.5 py-2 rounded-xl text-[12.5px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-[#171717] text-white shadow-xs'
                  : 'bg-white text-[#777570] hover:text-[#171717] hover:bg-[#F7F7F5] border border-[#E8E6E1]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Responsive Amenities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
        {filteredAmenities.map((amenity) => (
          <div
            key={amenity.id}
            className={`p-4.5 rounded-3xl border transition-all flex items-start justify-between gap-4 shadow-2xs ${
              amenity.enabled
                ? 'bg-white border-[#E8E6E1] hover:border-[#171717]/20'
                : 'bg-[#F7F7F5] border-[#E8E6E1]/60 opacity-65'
            }`}
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                  amenity.enabled
                    ? 'bg-[#FAF9F6] border-[#E8E6E1]'
                    : 'bg-[#EBE9E3] border-[#D1CFCA]'
                }`}
              >
                {getAmenityIcon(amenity.icon)}
              </div>
              <div className="min-w-0">
                <h3 className="text-[14.5px] font-black text-[#171717] tracking-tight truncate">
                  {amenity.name}
                </h3>
                <p className="text-[12px] text-[#777570] mt-0.5 leading-relaxed line-clamp-2">
                  {amenity.description}
                </p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#F1F0EC] text-[#777570]">
                  {amenity.category}
                </span>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => {
                haptics.tap();
                toggleAmenity(amenity.id);
                showToast(
                  amenity.enabled ? 'Amenity Disabled' : 'Amenity Enabled',
                  `${amenity.name} ${amenity.enabled ? 'hidden from' : 'visible on'} player app.`,
                  amenity.enabled ? 'info' : 'success'
                );
              }}
              className={`w-12 h-7 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                amenity.enabled ? 'bg-[#2FA66A]' : 'bg-[#D1CFCA]'
              }`}
            >
              <div
                className={`w-5.5 h-5.5 rounded-full bg-white shadow-md absolute top-0.75 transition-transform ${
                  amenity.enabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
