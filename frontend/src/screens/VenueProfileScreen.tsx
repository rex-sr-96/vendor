'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  Building2,
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  User,
  FileText,
  Calendar,
  Sparkles,
  Save,
  X,
  Star,
  Info,
  ExternalLink,
  Building,
  ArrowRight,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

export const VenueProfileScreen: React.FC = () => {
  const {
    venueName,
    venueCity,
    venueAddress,
    ownerPhone,
    ownerName,
    ownerEmail,
    ownerPan,
    venuePincode,
    venueEstablished,
    venueDescription,
    venuePhotos,
    addVenuePhoto,
    removeVenuePhoto,
    setVenueDetails,
    navigateTo,
    goBack,
    showToast,
  } = useApp();

  // Local form state
  const [vName, setVName] = useState(venueName || 'TurfTown Arena');
  const [vCity, setVCity] = useState(venueCity || 'Koramangala, Bengaluru');
  const [vAddress, setVAddress] = useState(venueAddress || 'Plot 42, Sector 5, Outer Ring Road, HSR Layout');
  const [vPincode, setVPincode] = useState(venuePincode || '560102');
  const [vEstablished, setVEstablished] = useState(venueEstablished || '2023');
  const [vDescription, setVDescription] = useState(
    venueDescription ||
      'Premier FIFA-grade synthetic turf and BWF-standard badminton courts with locker rooms, LED floodlights, and player lounge.'
  );

  const [oName, setOName] = useState(ownerName || 'Dhanush Kumar');
  const [oPhone, setOPhone] = useState(ownerPhone || '+91 98765 43210');
  const [oEmail, setOEmail] = useState(ownerEmail || 'owner@turftown.app');
  const [oPan, setOPan] = useState(ownerPan || 'ABCDE1234F');

  // Add Photo Modal
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [newPhotoLabel, setNewPhotoLabel] = useState('');
  const [selectedPresetUrl, setSelectedPresetUrl] = useState(
    'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=600&q=80'
  );

  const photoPresets = [
    {
      title: 'Floodlit Football Pitch',
      url: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Covered Cricket Arena',
      url: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Badminton Hardwood Court',
      url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Locker & Changing Rooms',
      url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Player Dugout & Lounge',
      url: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Pickleball Championship Court',
      url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (venuePhotos.length >= 8) {
      showToast('Maximum Reached', 'You can upload up to 8 photos maximum.', 'info');
      return;
    }
    const label = newPhotoLabel.trim() || `Facility Area ${venuePhotos.length + 1}`;
    addVenuePhoto({
      url: selectedPresetUrl,
      label,
    });
    setNewPhotoLabel('');
    setIsAddPhotoOpen(false);
    haptics.success();
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!vName.trim()) {
      showToast('Name Required', 'Please enter your venue name.', 'warning');
      return;
    }
    if (venuePhotos.length < 4) {
      showToast('Photos Required', 'Please keep at least 4 photos for active listing.', 'warning');
      return;
    }
    haptics.success();
    setVenueDetails({
      venueName: vName.trim(),
      venueCity: vCity.trim(),
      venueAddress: vAddress.trim(),
      venuePincode: vPincode.trim(),
      venueEstablished: vEstablished.trim(),
      venueDescription: vDescription.trim(),
      ownerName: oName.trim(),
      ownerPhone: oPhone.trim(),
      ownerEmail: oEmail.trim(),
      ownerPan: oPan.trim(),
    });
    showToast('Venue Profile Saved', 'Arena information and photo gallery updated successfully.', 'success');
  };

  return (
    <div className="pb-28 pt-2 w-full space-y-5">
      {/* Top Header & Back Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E8E6E1]/70">
        <button
          onClick={() => {
            haptics.tap();
            goBack();
          }}
          className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#FF6B2C] active-press cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to More</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#2FA66A] bg-[#2FA66A]/10 px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#2FA66A]/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>KYC Verified</span>
          </span>
        </div>
      </div>

      {/* Screen Title */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center border border-[#FF6B2C]/20">
            <Building2 className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-[20px] font-black text-[#171717] tracking-tight">Venue Profile & Photos</h1>
            <p className="text-[11.5px] text-[#777570]">Public arena details, location & player photo gallery</p>
          </div>
        </div>
      </div>


      {/* SECTION 1: VENUE PHOTO GALLERY */}
      <div className="bg-white rounded-3xl border border-[#E8E6E1] p-4 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#F1F0EC]">
          <div>
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#FF6B2C]" />
              <h2 className="text-[14px] font-black text-[#171717]">Venue Photo Gallery</h2>
            </div>
            <p className="text-[11px] text-[#777570]">High-res images shown to players on TurfTown</p>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                venuePhotos.length >= 4
                  ? 'bg-[#2FA66A]/10 text-[#2FA66A] border-[#2FA66A]/20'
                  : 'bg-[#E7A72F]/15 text-[#B87C0D] border-[#E7A72F]/30'
              }`}
            >
              {venuePhotos.length} / 8 Photos
            </span>
          </div>
        </div>

        {/* Info Pill */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] text-[11.5px] text-[#777570]">
          <Info className="w-4 h-4 text-[#FF6B2C] shrink-0" />
          <span>Minimum 4 photos required. Tap the trash icon to remove or add new court shots.</span>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {venuePhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative group rounded-2xl overflow-hidden border border-[#E8E6E1] bg-[#171717]/5 aspect-[4/3] shadow-2xs"
            >
              <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

              {/* Cover Photo Tag on First Image */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-[#FF6B2C] text-white text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Cover Photo</span>
                </div>
              )}

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => {
                  if (venuePhotos.length <= 4) {
                    showToast('Minimum Required', 'You must maintain at least 4 photos.', 'warning');
                    return;
                  }
                  removeVenuePhoto(photo.id);
                  haptics.tap();
                }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-[#D94B4B] text-white flex items-center justify-center backdrop-blur-md active-press cursor-pointer transition-colors"
                title="Delete Photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Photo Label */}
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-[11px] font-bold text-white truncate drop-shadow-sm">{photo.label}</p>
                <p className="text-[9px] text-white/70">Photo #{index + 1}</p>
              </div>
            </div>
          ))}

          {/* Add Photo Card if under 8 */}
          {venuePhotos.length < 8 && (
            <button
              type="button"
              onClick={() => {
                haptics.tap();
                setIsAddPhotoOpen(true);
              }}
              className="aspect-[4/3] rounded-2xl border-2 border-dashed border-[#FF6B2C]/40 bg-[#FF6B2C]/5 hover:bg-[#FF6B2C]/10 flex flex-col items-center justify-center gap-1.5 text-[#FF6B2C] active-press cursor-pointer transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-[#FF6B2C]/15 flex items-center justify-center">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[11.5px] font-black">Add New Photo</span>
              <span className="text-[9.5px] text-[#777570]">Up to 8 max</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 2: ARENA & VENUE INFORMATION */}
      <div className="bg-white rounded-3xl border border-[#E8E6E1] p-4 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#F1F0EC]">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#FF6B2C]" />
            <h2 className="text-[14px] font-black text-[#171717]">Arena & Venue Information</h2>
          </div>
          <span className="text-[10px] font-bold text-[#FF6B2C] bg-[#FF6B2C]/10 px-2 py-0.5 rounded-full">
            Public View
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-[#777570] mb-1">
              Venue Name <span className="text-[#FF6B2C]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={vName}
                onChange={(e) => setVName(e.target.value)}
                placeholder="e.g. TurfTown Arena"
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl px-3.5 py-2.5 text-[13px] font-bold text-[#171717] focus:bg-white focus:outline-none focus:border-[#FF6B2C] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#777570] mb-1">
              City & Area <span className="text-[#FF6B2C]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={vCity}
                onChange={(e) => setVCity(e.target.value)}
                placeholder="e.g. Koramangala, Bengaluru"
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl px-3.5 py-2.5 text-[13px] font-bold text-[#171717] focus:bg-white focus:outline-none focus:border-[#FF6B2C] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#777570] mb-1">Street Address</label>
            <input
              type="text"
              value={vAddress}
              onChange={(e) => setVAddress(e.target.value)}
              placeholder="Plot or building number, street name"
              className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl px-3.5 py-2.5 text-[13px] font-bold text-[#171717] focus:bg-white focus:outline-none focus:border-[#FF6B2C] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-[#777570] mb-1">Pincode</label>
              <input
                type="text"
                value={vPincode}
                onChange={(e) => setVPincode(e.target.value)}
                placeholder="560102"
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:bg-white focus:outline-none focus:border-[#FF6B2C] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#777570] mb-1">Established Year</label>
              <input
                type="text"
                value={vEstablished}
                onChange={(e) => setVEstablished(e.target.value)}
                placeholder="2023"
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:bg-white focus:outline-none focus:border-[#FF6B2C] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#777570] mb-1">About the Arena (Public Bio)</label>
            <textarea
              rows={3}
              value={vDescription}
              onChange={(e) => setVDescription(e.target.value)}
              placeholder="Highlight turf grade, lighting, amenities, changing rooms..."
              className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl p-3 text-[12.5px] font-medium text-[#171717] focus:bg-white focus:outline-none focus:border-[#FF6B2C] transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: OWNER & LICENSEE DETAILS */}
      <div className="bg-white rounded-3xl border border-[#E8E6E1] p-4 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#F1F0EC]">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-[#2FA66A]" />
            <h2 className="text-[14px] font-black text-[#171717]">Owner / Licensee Credentials</h2>
          </div>
          <span className="text-[10px] font-bold text-[#2FA66A] bg-[#2FA66A]/10 px-2 py-0.5 rounded-full border border-[#2FA66A]/20">
            Verified
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-[#777570] mb-1">
              Owner Full Name <span className="text-[#FF6B2C]">*</span>
            </label>
            <input
              type="text"
              required
              value={oName}
              onChange={(e) => setOName(e.target.value)}
              placeholder="Full legal name"
              className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl px-3.5 py-2.5 text-[13px] font-bold text-[#171717] focus:bg-white focus:outline-none focus:border-[#FF6B2C] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#777570] mb-1">
              Registered Phone Number <span className="text-[#FF6B2C]">*</span>
            </label>
            <input
              type="tel"
              required
              value={oPhone}
              onChange={(e) => setOPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl px-3.5 py-2.5 text-[13px] font-bold text-[#171717] focus:bg-white focus:outline-none focus:border-[#FF6B2C] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#777570] mb-1">Owner Email Address</label>
            <input
              type="email"
              value={oEmail}
              onChange={(e) => setOEmail(e.target.value)}
              placeholder="owner@turftown.app"
              className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl px-3.5 py-2.5 text-[13px] font-bold text-[#171717] focus:bg-white focus:outline-none focus:border-[#FF6B2C] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#777570] mb-1">PAN / Government ID</label>
            <input
              type="text"
              value={oPan}
              onChange={(e) => setOPan(e.target.value)}
              placeholder="ABCDE1234F"
              className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl px-3.5 py-2.5 text-[13px] font-bold text-[#171717] uppercase focus:bg-white focus:outline-none focus:border-[#FF6B2C] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* DOCKED SAVE BUTTON BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-[#E8E6E1] flex items-center justify-between gap-3 z-40 max-w-[440px] mx-auto">
        <button
          type="button"
          onClick={() => {
            haptics.tap();
            goBack();
          }}
          className="h-11 px-4 rounded-2xl border border-[#E8E6E1] bg-[#FAF9F6] text-[#171717] text-[12.5px] font-bold active-press cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="flex-1 h-11 rounded-2xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white text-[13px] font-black flex items-center justify-center gap-2 shadow-sm active-press cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Profile & Photos</span>
        </button>
      </div>

      {/* ADD PHOTO MODAL */}
      {isAddPhotoOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[440px] rounded-t-3xl sm:rounded-3xl border border-[#E8E6E1] shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
            {/* Sheet Header */}
            <div className="p-4 border-b border-[#E8E6E1] flex items-center justify-between bg-[#FAF9F6]">
              <div>
                <h3 className="text-[15px] font-black text-[#171717]">Add Photo to Gallery</h3>
                <p className="text-[11.5px] text-[#777570]">Select a facility area or enter photo label</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPhotoOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#E8E6E1] flex items-center justify-center text-[#777570] hover:text-[#171717] active-press cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sheet Content */}
            <form onSubmit={handleAddPhotoSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-[11px] font-bold text-[#777570] mb-1.5">
                  Select Photo Sample / View
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {photoPresets.map((preset) => {
                    const isSelected = selectedPresetUrl === preset.url;
                    return (
                      <div
                        key={preset.title}
                        onClick={() => {
                          haptics.tap();
                          setSelectedPresetUrl(preset.url);
                          if (!newPhotoLabel) setNewPhotoLabel(preset.title);
                        }}
                        className={`relative rounded-xl overflow-hidden border-2 cursor-pointer active-press transition-all aspect-[16/10] ${
                          isSelected ? 'border-[#FF6B2C] ring-2 ring-[#FF6B2C]/20' : 'border-[#E8E6E1]'
                        }`}
                      >
                        <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <span className="absolute bottom-1.5 left-2 right-2 text-[10px] font-bold text-white truncate">
                          {preset.title}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#FF6B2C] text-white flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#777570] mb-1">Photo Caption / Label</label>
                <input
                  type="text"
                  value={newPhotoLabel}
                  onChange={(e) => setNewPhotoLabel(e.target.value)}
                  placeholder="e.g. Main Pitch 1 (Floodlit)"
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-[13px] font-bold text-[#171717] focus:bg-white focus:outline-none focus:border-[#FF6B2C]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white text-[13px] font-black flex items-center justify-center gap-1.5 shadow-sm active-press cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Photo to Gallery</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
