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
  SunMedium,
  DoorOpen,
  Armchair,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

export const AmenitiesScreen: React.FC = () => {
  const { amenities, toggleAmenity, goBack, showToast } = useApp();
  const [filter, setFilter] = useState<string>('all');

  const activeCount = amenities.filter((a) => a.enabled).length;

  const categories = [
    { id: 'all', label: 'All Amenities' },
    { id: 'Lighting', label: 'Lighting' },
    { id: 'Facility', label: 'Facilities' },
    { id: 'Refreshment', label: 'Refreshments' },
    { id: 'Safety', label: 'Safety & First Aid' },
    { id: 'Equipment', label: 'Equipment' },
  ];

  const filteredAmenities = amenities.filter((a) => {
    if (filter === 'all') return true;
    return a.category.toLowerCase() === filter.toLowerCase();
  });

  const getAmenityIcon = (iconName: string) => {
    switch (iconName) {
      case 'SunMedium':
      case 'Zap':
        return <SunMedium className="w-5 h-5 text-[#F94001]" />;
      case 'DoorOpen':
      case 'ShowerHead':
        return <DoorOpen className="w-5 h-5 text-[#16A34A]" />;
      case 'Droplets':
        return <Droplets className="w-5 h-5 text-[#3B82F6]" />;
      case 'Car':
        return <Car className="w-5 h-5 text-[#8B5CF6]" />;
      case 'Shirt':
        return <Shirt className="w-5 h-5 text-[#EC4899]" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-[#F59E0B]" />;
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-[#EF4444]" />;
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-[#F59E0B]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-[#6366F1]" />;
      case 'Armchair':
        return <Armchair className="w-5 h-5 text-[#EC4899]" />;
      case 'Users':
        return <Users className="w-5 h-5 text-[#10B981]" />;
      case 'Wifi':
        return <Wifi className="w-5 h-5 text-[#06B6D4]" />;
      case 'BatteryCharging':
        return <BatteryCharging className="w-5 h-5 text-[#84CC16]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#F94001]" />;
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
        className="md:hidden flex items-center gap-1.5 text-[12.5px] font-bold text-[#F94001] active-press cursor-pointer pb-1"
      >
        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        <span>Back to Settings</span>
      </button>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]/70">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-black text-[#021526] tracking-tight">Venue Amenities</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20">
              Admin Standardized
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F3F4F4] text-[#5F6368] border border-[#E5E7EB]">
              {activeCount} of {amenities.length} Active on App
            </span>
          </div>
          <p className="text-[12.5px] font-medium text-[#5F6368]">
            Only verified admin-defined amenities are shown. Select which facility amenities are highlighted to players during online booking.
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
                  ? 'bg-[#F94001] text-white shadow-sm'
                  : 'bg-white text-[#5F6368] hover:text-[#021526] hover:bg-[#F3F4F4] border border-[#E5E7EB]'
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
                ? 'bg-white border-[#E5E7EB] hover:border-[#021526]/20'
                : 'bg-[#F3F4F4] border-[#E5E7EB]/60 opacity-65'
            }`}
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                  amenity.enabled
                    ? 'bg-[#F3F4F4] border-[#E5E7EB]'
                    : 'bg-[#EBE9E3] border-[#E5E7EB]'
                }`}
              >
                {getAmenityIcon(amenity.icon)}
              </div>
              <div className="min-w-0">
                <h3 className="text-[14.5px] font-black text-[#021526] tracking-tight truncate">
                  {amenity.name}
                </h3>
                <p className="text-[12px] text-[#5F6368] mt-0.5 leading-relaxed line-clamp-2">
                  {amenity.description || amenity.details}
                </p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#F3F4F4] text-[#5F6368]">
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
                amenity.enabled ? 'bg-[#16A34A]' : 'bg-[#E5E7EB]'
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
