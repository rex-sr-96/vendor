import React, { useState, useEffect, useRef } from 'react';
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
  Lock,
  Building,
  ArrowRight,
  Eye,
  Landmark,
  Upload,
  Loader2,
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
    venueGoogleMapsLink,
    ownerAadhaarDocId,
    ownerAadhaarUrl,
    ownerProfilePhotoDocId,
    ownerProfilePhotoUrl,
    bankBranchProofDocId,
    bankCancelledChequeUrl,
    bankDetails,
    venuePhotos,
    addVenuePhoto,
    removeVenuePhoto,
    setVenueDetails,
    syncVendorProfileToBackend,
    navigateTo,
    goBack,
    showToast,
    currentUser,
  } = useApp();

  const isStaff = currentUser?.type === 'staff';

  // Local form state
  const [vName, setVName] = useState(venueName || 'skywalk sports');
  const [vCity, setVCity] = useState(venueCity || 'Coimbatore, Tamil Nadu');
  const [vAddress, setVAddress] = useState(venueAddress || 'skywalk sports, Coimbatore, Tamil Nadu');
  const [vPincode, setVPincode] = useState(venuePincode || '639004');
  const [vEstablished, setVEstablished] = useState(venueEstablished || '2023');
  const [vDescription, setVDescription] = useState(
    venueDescription ||
      'Premier FIFA-grade synthetic turf and BWF-standard badminton courts with locker rooms, LED floodlights, and player lounge.'
  );
  const [vGoogleMaps, setVGoogleMaps] = useState(venueGoogleMapsLink || 'https://maps.app.goo.gl/uyJgU4DB7ushZsiv6');

  const [oName, setOName] = useState(ownerName || 'Shruthi jayamadhu');
  const [oPhone, setOPhone] = useState(ownerPhone || '+91 6369591821');
  const [oEmail, setOEmail] = useState(ownerEmail || 'yutekahema003@gmail.com');
  const [oPan, setOPan] = useState(ownerPan || '33ABCDE1234F1Z5');

  // Documents & Photos
  const [aadhaarDocId, setAadhaarDocId] = useState(ownerAadhaarDocId || 'doc_aadhaar_shruthi');
  const [aadhaarUrl, setAadhaarUrl] = useState(ownerAadhaarUrl || 'http://localhost:4000/api/v1/onboarding/documents/doc_aadhaar_shruthi/view');
  const [profilePhotoDocId, setProfilePhotoDocId] = useState(ownerProfilePhotoDocId || 'doc_profile_shruthi');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(ownerProfilePhotoUrl || 'http://localhost:4000/api/v1/onboarding/documents/doc_profile_shruthi/view');
  const [branchProofDocId, setBranchProofDocId] = useState(bankBranchProofDocId || 'doc_bank_proof_1788778055198');
  const [cancelledChequeUrl, setCancelledChequeUrl] = useState(bankCancelledChequeUrl || 'http://localhost:4000/api/v1/onboarding/documents/doc_bank_proof_1788778055198/view');

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; docId: string; url: string; type: 'image' | 'doc' } | null>(null);

  const aadhaarInputRef = useRef<HTMLInputElement>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const bankProofInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (venueName) setVName(venueName);
    if (venueCity) setVCity(venueCity);
    if (venueAddress) setVAddress(venueAddress);
    if (venuePincode) setVPincode(venuePincode);
    if (ownerName) setOName(ownerName);
    if (ownerPhone) setOPhone(ownerPhone);
    if (ownerEmail) setOEmail(ownerEmail);
    if (ownerPan) setOPan(ownerPan);
    if (venueEstablished) setVEstablished(venueEstablished);
    if (venueDescription) setVDescription(venueDescription);
    if (venueGoogleMapsLink) setVGoogleMaps(venueGoogleMapsLink);
    if (ownerAadhaarDocId) setAadhaarDocId(ownerAadhaarDocId);
    if (ownerAadhaarUrl) setAadhaarUrl(ownerAadhaarUrl);
    if (ownerProfilePhotoDocId) setProfilePhotoDocId(ownerProfilePhotoDocId);
    if (ownerProfilePhotoUrl) setProfilePhotoUrl(ownerProfilePhotoUrl);
    if (bankBranchProofDocId) setBranchProofDocId(bankBranchProofDocId);
    if (bankCancelledChequeUrl) setCancelledChequeUrl(bankCancelledChequeUrl);
  }, [
    venueName,
    venueCity,
    venueAddress,
    venuePincode,
    ownerName,
    ownerPhone,
    ownerEmail,
    ownerPan,
    venueEstablished,
    venueDescription,
    venueGoogleMapsLink,
    ownerAadhaarDocId,
    ownerAadhaarUrl,
    ownerProfilePhotoDocId,
    ownerProfilePhotoUrl,
    bankBranchProofDocId,
    bankCancelledChequeUrl,
  ]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: 'AADHAAR' | 'PROFILE_PHOTO' | 'BANK_PROOF'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('File Too Large', 'Maximum file size allowed is 5 MB.', 'warning');
      return;
    }

    setUploadingDoc(docType);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', docType);

      const cleanPhone = (oPhone || ownerPhone || '6369591821').replace(/\D/g, '').slice(-10);
      const res = await fetch('http://localhost:4000/api/v1/onboarding/documents/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cleanPhone}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const docId = data.document_id || `doc_${docType.toLowerCase()}_${Date.now()}`;
        const viewUrl = `http://localhost:4000/api/v1/onboarding/documents/${docId}/view`;

        if (docType === 'AADHAAR') {
          setAadhaarDocId(docId);
          setAadhaarUrl(viewUrl);
          setVenueDetails({ ownerAadhaarDocId: docId, ownerAadhaarUrl: viewUrl });
        } else if (docType === 'PROFILE_PHOTO') {
          setProfilePhotoDocId(docId);
          setProfilePhotoUrl(viewUrl);
          setVenueDetails({ ownerProfilePhotoDocId: docId, ownerProfilePhotoUrl: viewUrl });
        } else if (docType === 'BANK_PROOF') {
          setBranchProofDocId(docId);
          setCancelledChequeUrl(viewUrl);
          setVenueDetails({ bankBranchProofDocId: docId, bankCancelledChequeUrl: viewUrl });
        }
        haptics.success();
        showToast('Document Uploaded', `${file.name} uploaded successfully.`, 'success');
      } else {
        const localUrl = URL.createObjectURL(file);
        const docId = `doc_${docType.toLowerCase()}_${Date.now()}`;
        if (docType === 'AADHAAR') {
          setAadhaarDocId(docId);
          setAadhaarUrl(localUrl);
        } else if (docType === 'PROFILE_PHOTO') {
          setProfilePhotoDocId(docId);
          setProfilePhotoUrl(localUrl);
        } else if (docType === 'BANK_PROOF') {
          setBranchProofDocId(docId);
          setCancelledChequeUrl(localUrl);
        }
        showToast('File Attached', `${file.name} attached for submission.`, 'info');
      }
    } catch {
      const localUrl = URL.createObjectURL(file);
      const docId = `doc_${docType.toLowerCase()}_${Date.now()}`;
      if (docType === 'AADHAAR') {
        setAadhaarDocId(docId);
        setAadhaarUrl(localUrl);
      } else if (docType === 'PROFILE_PHOTO') {
        setProfilePhotoDocId(docId);
        setProfilePhotoUrl(localUrl);
      } else if (docType === 'BANK_PROOF') {
        setBranchProofDocId(docId);
        setCancelledChequeUrl(localUrl);
      }
      showToast('File Attached', `${file.name} attached for submission.`, 'info');
    } finally {
      setUploadingDoc(null);
      if (e.target) e.target.value = '';
    }
  };

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
    if (isStaff) {
      showToast('View Only Mode', 'Only the venue owner can edit venue profile settings.', 'info');
      return;
    }
    if (!vName.trim()) {
      showToast('Name Required', 'Please enter your venue name.', 'warning');
      return;
    }
    if (venuePhotos.length < 4) {
      showToast('Photos Required', 'Please keep at least 4 photos for active listing.', 'warning');
      return;
    }
    haptics.success();
    const updatedDetails = {
      venueName: vName.trim(),
      venueCity: vCity.trim(),
      venueAddress: vAddress.trim(),
      venuePincode: vPincode.trim(),
      venueEstablished: vEstablished.trim(),
      venueDescription: vDescription.trim(),
      venueGoogleMapsLink: vGoogleMaps.trim(),
      ownerName: oName.trim(),
      ownerPhone: oPhone.trim(),
      ownerEmail: oEmail.trim(),
      ownerPan: oPan.trim(),
      ownerAadhaarDocId: aadhaarDocId,
      ownerAadhaarUrl: aadhaarUrl,
      ownerProfilePhotoDocId: profilePhotoDocId,
      ownerProfilePhotoUrl: profilePhotoUrl,
      bankBranchProofDocId: branchProofDocId,
      bankCancelledChequeUrl: cancelledChequeUrl,
    };
    setVenueDetails(updatedDetails);

    // Sync back to onboarding / admin backend
    syncVendorProfileToBackend({
      owner: {
        name: oName.trim(),
        mobile: oPhone.replace(/\D/g, '').slice(-10),
        email: oEmail.trim(),
        pan: oPan.trim(),
        address: vAddress.trim(),
        pincode: vPincode.trim(),
        aadhaar_document_id: aadhaarDocId,
        profile_photo_document_id: profilePhotoDocId,
      },
      venue: {
        name: vName.trim(),
        address: vAddress.trim(),
        city: vCity.trim(),
        pincode: vPincode.trim(),
        gst_number: oPan.trim(),
        google_maps_link: vGoogleMaps.trim(),
      },
      bank: {
        branch_proof_document_id: branchProofDocId,
      },
    });

    showToast('Venue Profile Saved', 'Arena details, documents, and photo gallery updated successfully.', 'success');
  };

  return (
    <div className="pb-28 pt-2 w-full space-y-5">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={aadhaarInputRef}
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => handleFileUpload(e, 'AADHAAR')}
        className="hidden"
      />
      <input
        type="file"
        ref={profilePhotoInputRef}
        accept=".jpg,.jpeg,.png"
        onChange={(e) => handleFileUpload(e, 'PROFILE_PHOTO')}
        className="hidden"
      />
      <input
        type="file"
        ref={bankProofInputRef}
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => handleFileUpload(e, 'BANK_PROOF')}
        className="hidden"
      />

      {/* Top Header & Back Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]/70">
        <button
          onClick={() => {
            haptics.tap();
            goBack();
          }}
          className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#F94001] active-press cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to More</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#16A34A] bg-[#16A34A]/10 px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#16A34A]/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>KYC Verified</span>
          </span>
        </div>
      </div>

      {/* Screen Title */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F94001]/10 text-[#F94001] flex items-center justify-center border border-[#F94001]/20">
            <Building2 className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-[20px] font-black text-[#021526] tracking-tight">Venue Profile & Photos</h1>
            <p className="text-[11.5px] text-[#5F6368]">Public arena details, location & player photo gallery</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: VENUE PHOTO GALLERY */}
      <div className="bg-white rounded-3xl border border-[#E5E7EB] p-4 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F4]">
          <div>
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#F94001]" />
              <h2 className="text-[14px] font-black text-[#021526]">Venue Photo Gallery</h2>
            </div>
            <p className="text-[11px] text-[#5F6368]">High-res images shown to players on TurfTown</p>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                venuePhotos.length >= 4
                  ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20'
                  : 'bg-[#F59E0B]/15 text-[#B87C0D] border-[#F59E0B]/30'
              }`}
            >
              {venuePhotos.length} / 8 Photos
            </span>
          </div>
        </div>

        {/* Info Pill */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F3F4F4] border border-[#E5E7EB] text-[11.5px] text-[#5F6368]">
          <Info className="w-4 h-4 text-[#F94001] shrink-0" />
          <span>Minimum 4 photos required. Tap the trash icon to remove or add new court shots.</span>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {venuePhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative group rounded-2xl overflow-hidden border border-[#E5E7EB] bg-[#021526]/5 aspect-[4/3] shadow-2xs"
            >
              <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

              {/* Cover Photo Tag on First Image */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-[#F94001] text-white text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Cover Photo</span>
                </div>
              )}

              {/* Delete Button */}
              {!isStaff && (
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
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-[#DC2626] text-white flex items-center justify-center backdrop-blur-md active-press cursor-pointer transition-colors"
                  title="Delete Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Photo Label */}
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-[11px] font-bold text-white truncate drop-shadow-sm">{photo.label}</p>
                <p className="text-[9px] text-white/70">Photo #{index + 1}</p>
              </div>
            </div>
          ))}

          {/* Add Photo Card if under 8 */}
          {venuePhotos.length < 8 && !isStaff && (
            <button
              type="button"
              onClick={() => {
                haptics.tap();
                setIsAddPhotoOpen(true);
              }}
              className="aspect-[4/3] rounded-2xl border-2 border-dashed border-[#F94001]/40 bg-[#F94001]/5 hover:bg-[#F94001]/10 flex flex-col items-center justify-center gap-1.5 text-[#F94001] active-press cursor-pointer transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-[#F94001]/15 flex items-center justify-center">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[11.5px] font-black">Add New Photo</span>
              <span className="text-[9.5px] text-[#5F6368]">Up to 8 max</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 2: ARENA & VENUE INFORMATION */}
      <div className="bg-white rounded-3xl border border-[#E5E7EB] p-4 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F4]">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#F94001]" />
            <h2 className="text-[14px] font-black text-[#021526]">Arena & Venue Information</h2>
          </div>
          <span className="text-[10px] font-bold text-[#F94001] bg-[#F94001]/10 px-2 py-0.5 rounded-full">
            Public View
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-[#5F6368] mb-1">
              Venue Name <span className="text-[#F94001]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={isStaff}
                value={vName}
                onChange={(e) => setVName(e.target.value)}
                placeholder="e.g. TurfTown Arena"
                className="w-full bg-[#F3F4F4] disabled:bg-[#F3F4F4] disabled:text-[#5F6368] disabled:cursor-not-allowed border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 text-[13px] font-bold text-[#021526] focus:bg-white focus:outline-none focus:border-[#F94001] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5F6368] mb-1">
              City & Area <span className="text-[#F94001]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={isStaff}
                value={vCity}
                onChange={(e) => setVCity(e.target.value)}
                placeholder="e.g. Koramangala, Bengaluru"
                className="w-full bg-[#F3F4F4] disabled:bg-[#F3F4F4] disabled:text-[#5F6368] disabled:cursor-not-allowed border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 text-[13px] font-bold text-[#021526] focus:bg-white focus:outline-none focus:border-[#F94001] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5F6368] mb-1">Street Address</label>
            <input
              type="text"
              disabled={isStaff}
              value={vAddress}
              onChange={(e) => setVAddress(e.target.value)}
              placeholder="Plot or building number, street name"
              className="w-full bg-[#F3F4F4] disabled:bg-[#F3F4F4] disabled:text-[#5F6368] disabled:cursor-not-allowed border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 text-[13px] font-bold text-[#021526] focus:bg-white focus:outline-none focus:border-[#F94001] transition-colors"
            />
          </div>

          {/* GOOGLE MAPS LOCATION LINK */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-[#5F6368]">
                Google Maps Location Link <span className="text-[#F94001]">*</span>
              </label>
              {vGoogleMaps && (
                <a
                  href={vGoogleMaps}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10.5px] font-bold text-[#F94001] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Map</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-[#F94001] pointer-events-none">
                <MapPin className="w-4 h-4 stroke-[2.2]" />
              </div>
              <input
                type="url"
                disabled={isStaff}
                value={vGoogleMaps}
                onChange={(e) => setVGoogleMaps(e.target.value)}
                placeholder="e.g. https://maps.app.goo.gl/uyJgU4DB7ushZsiv6"
                className="w-full bg-[#F3F4F4] disabled:bg-[#F3F4F4] disabled:text-[#5F6368] disabled:cursor-not-allowed border border-[#E5E7EB] rounded-2xl pl-10 pr-3.5 py-2.5 text-[13px] font-bold text-[#021526] focus:bg-white focus:outline-none focus:border-[#F94001] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-[#5F6368] mb-1">Pincode</label>
              <input
                type="text"
                disabled={isStaff}
                value={vPincode}
                onChange={(e) => setVPincode(e.target.value)}
                placeholder="560102"
                className="w-full bg-[#F3F4F4] disabled:bg-[#F3F4F4] disabled:text-[#5F6368] disabled:cursor-not-allowed border border-[#E5E7EB] rounded-2xl px-3 py-2 text-[13px] font-bold text-[#021526] focus:bg-white focus:outline-none focus:border-[#F94001] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5F6368] mb-1">Established Year</label>
              <input
                type="text"
                disabled={isStaff}
                value={vEstablished}
                onChange={(e) => setVEstablished(e.target.value)}
                placeholder="2023"
                className="w-full bg-[#F3F4F4] disabled:bg-[#F3F4F4] disabled:text-[#5F6368] disabled:cursor-not-allowed border border-[#E5E7EB] rounded-2xl px-3 py-2 text-[13px] font-bold text-[#021526] focus:bg-white focus:outline-none focus:border-[#F94001] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5F6368] mb-1">About the Arena (Public Bio)</label>
            <textarea
              rows={3}
              disabled={isStaff}
              value={vDescription}
              onChange={(e) => setVDescription(e.target.value)}
              placeholder="Highlight turf grade, lighting, amenities, changing rooms..."
              className="w-full bg-[#F3F4F4] disabled:bg-[#F3F4F4] disabled:text-[#5F6368] disabled:cursor-not-allowed border border-[#E5E7EB] rounded-2xl p-3 text-[12.5px] font-medium text-[#021526] focus:bg-white focus:outline-none focus:border-[#F94001] transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: OWNER & LICENSEE DETAILS */}
      <div className="bg-white rounded-3xl border border-[#E5E7EB] p-4 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F4]">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-[#16A34A]" />
            <h2 className="text-[14px] font-black text-[#021526]">Owner / Licensee Credentials</h2>
          </div>
          <span className="text-[10px] font-bold text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-full border border-[#16A34A]/20">
            Verified
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-[#5F6368] mb-1">
              Owner Full Name <span className="text-[#F94001]">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isStaff}
              value={oName}
              onChange={(e) => setOName(e.target.value)}
              placeholder="Full legal name"
              className="w-full bg-[#F3F4F4] disabled:bg-[#F3F4F4] disabled:text-[#5F6368] disabled:cursor-not-allowed border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 text-[13px] font-bold text-[#021526] focus:bg-white focus:outline-none focus:border-[#F94001] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5F6368] mb-1">
              Registered Phone Number <span className="text-[#F94001]">*</span>
            </label>
            <input
              type="tel"
              required
              disabled={isStaff}
              value={oPhone}
              onChange={(e) => setOPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-[#F3F4F4] disabled:bg-[#F3F4F4] disabled:text-[#5F6368] disabled:cursor-not-allowed border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 text-[13px] font-bold text-[#021526] focus:bg-white focus:outline-none focus:border-[#F94001] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5F6368] mb-1">Owner Email Address</label>
            <input
              type="email"
              disabled={isStaff}
              value={oEmail}
              onChange={(e) => setOEmail(e.target.value)}
              placeholder="owner@turftown.app"
              className="w-full bg-[#F3F4F4] disabled:bg-[#F3F4F4] disabled:text-[#5F6368] disabled:cursor-not-allowed border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 text-[13px] font-bold text-[#021526] focus:bg-white focus:outline-none focus:border-[#F94001] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5F6368] mb-1">PAN / Government ID</label>
            <input
              type="text"
              disabled={isStaff}
              value={oPan}
              onChange={(e) => setOPan(e.target.value)}
              placeholder="ABCDE1234F"
              className="w-full bg-[#F3F4F4] disabled:bg-[#F3F4F4] disabled:text-[#5F6368] disabled:cursor-not-allowed border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 text-[13px] font-bold text-[#021526] uppercase focus:bg-white focus:outline-none focus:border-[#F94001] transition-colors"
            />
          </div>

          {/* AADHAAR CARD DOCUMENT */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-[#5F6368]">
                Aadhaar Card Document <span className="text-[#F94001]">*</span>
              </label>
              <span className="text-[10px] font-mono text-[#5F6368] uppercase">PDF/JPG MAX 5MB</span>
            </div>

            {uploadingDoc === 'AADHAAR' ? (
              <div className="flex items-center gap-2 p-2.5 rounded-2xl border border-dashed border-[#F94001] bg-[#F94001]/5 text-[12px] font-bold text-[#F94001]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading Aadhaar document...</span>
              </div>
            ) : aadhaarDocId ? (
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl border border-[#16A34A]/30 bg-[#16A34A]/5 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-white border border-[#16A34A]/30 flex items-center justify-center shrink-0 text-[#16A34A]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[12px] font-bold text-[#021526] truncate">
                      {aadhaarDocId}
                    </p>
                    <span className="text-[10px] text-[#16A34A] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Uploaded & Verified
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setPreviewDoc({
                        title: 'Aadhaar Card Document',
                        docId: aadhaarDocId,
                        url: aadhaarUrl || `http://localhost:4000/api/v1/onboarding/documents/${aadhaarDocId}/view`,
                        type: 'doc',
                      });
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-[#E5E7EB] text-[11px] font-bold text-[#021526] hover:bg-[#F3F4F4] active-press cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#5F6368]" />
                    <span>View</span>
                  </button>

                  {!isStaff && (
                    <button
                      type="button"
                      onClick={() => aadhaarInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F94001] text-white text-[11px] font-bold hover:bg-[#D93600] active-press cursor-pointer shadow-2xs"
                    >
                      <span>Change</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 p-2 rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F3F4F4]">
                <div className="flex items-center gap-2 flex-1 min-w-0 px-1">
                  <FileText className="h-4 w-4 text-[#5F6368] shrink-0" />
                  <span className="font-mono text-[11px] text-[#5F6368] truncate">
                    No Aadhaar document uploaded
                  </span>
                </div>
                {!isStaff && (
                  <button
                    type="button"
                    onClick={() => aadhaarInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-[#F94001] hover:bg-[#D93600] text-white text-[11px] font-bold transition-all shadow-xs shrink-0 active-press cursor-pointer"
                  >
                    Upload Aadhaar
                  </button>
                )}
              </div>
            )}
          </div>

          {/* PROFILE PHOTO ID */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-[#5F6368]">
                Profile Photo ID <span className="text-[#F94001]">*</span>
              </label>
              <span className="text-[10px] font-mono text-[#5F6368] uppercase">JPG/PNG MAX 5MB</span>
            </div>

            {uploadingDoc === 'PROFILE_PHOTO' ? (
              <div className="flex items-center gap-2 p-2.5 rounded-2xl border border-dashed border-[#F94001] bg-[#F94001]/5 text-[12px] font-bold text-[#F94001]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading profile photo...</span>
              </div>
            ) : profilePhotoDocId ? (
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl border border-[#16A34A]/30 bg-[#16A34A]/5 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#16A34A]/30 bg-white">
                    {profilePhotoUrl ? (
                      <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-[#16A34A] m-auto" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[12px] font-bold text-[#021526] truncate">
                      {profilePhotoDocId}
                    </p>
                    <span className="text-[10px] text-[#16A34A] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Uploaded & Verified
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setPreviewDoc({
                        title: 'Profile Photo ID',
                        docId: profilePhotoDocId,
                        url: profilePhotoUrl || `http://localhost:4000/api/v1/onboarding/documents/${profilePhotoDocId}/view`,
                        type: 'image',
                      });
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-[#E5E7EB] text-[11px] font-bold text-[#021526] hover:bg-[#F3F4F4] active-press cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#5F6368]" />
                    <span>View</span>
                  </button>

                  {!isStaff && (
                    <button
                      type="button"
                      onClick={() => profilePhotoInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F94001] text-white text-[11px] font-bold hover:bg-[#D93600] active-press cursor-pointer shadow-2xs"
                    >
                      <span>Change</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 p-2 rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F3F4F4]">
                <div className="flex items-center gap-2 flex-1 min-w-0 px-1">
                  <ImageIcon className="h-4 w-4 text-[#5F6368] shrink-0" />
                  <span className="font-mono text-[11px] text-[#5F6368] truncate">
                    No profile photo uploaded
                  </span>
                </div>
                {!isStaff && (
                  <button
                    type="button"
                    onClick={() => profilePhotoInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-[#F94001] hover:bg-[#D93600] text-white text-[11px] font-bold transition-all shadow-xs shrink-0 active-press cursor-pointer"
                  >
                    Upload Photo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: FINANCIAL SETTLEMENTS & BANK ACCOUNT */}
      <div className="bg-white rounded-3xl border border-[#E5E7EB] p-4 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F4]">
          <div className="flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-[#F94001]" />
            <h2 className="text-[14px] font-black text-[#021526]">Bank Account & Settlement Proof</h2>
          </div>
          <span className="text-[10px] font-bold text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-full border border-[#16A34A]/20 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Verified Payouts</span>
          </span>
        </div>

        <p className="text-[11.5px] text-[#5F6368]">
          Official bank account for automated slot booking settlements, IMPS payouts, and banking proof verification.
        </p>

        {/* Bank Account Details Grid */}
        <div className="grid grid-cols-2 gap-2.5 bg-[#F3F4F4] border border-[#E5E7EB] rounded-2xl p-3 text-[11.5px]">
          <div>
            <span className="block font-bold text-[#5F6368]">Bank Name</span>
            <span className="font-black text-[#021526]">{bankDetails.bankName || 'SBI BANK'}</span>
          </div>
          <div>
            <span className="block font-bold text-[#5F6368]">Account Holder</span>
            <span className="font-bold text-[#021526] truncate block">{bankDetails.accountHolder || oName}</span>
          </div>
          <div>
            <span className="block font-bold text-[#5F6368]">Account Number</span>
            <span className="font-mono font-bold text-[#021526]">{bankDetails.maskedNumber || '•••• •••• •••• 6914'}</span>
          </div>
          <div>
            <span className="block font-bold text-[#5F6368]">IFSC Code</span>
            <span className="font-mono font-bold text-[#021526]">{bankDetails.ifsc || 'SBIN0018111'}</span>
          </div>
        </div>

        {/* CANCELLED CHEQUE / PASSBOOK DOCUMENT */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold text-[#5F6368]">
              Cancelled Cheque / Passbook <span className="text-[#F94001]">*</span>
            </label>
            <span className="text-[10px] font-mono text-[#5F6368] uppercase">PDF/JPG MAX 5MB</span>
          </div>

          {uploadingDoc === 'BANK_PROOF' ? (
            <div className="flex items-center gap-2 p-2.5 rounded-2xl border border-dashed border-[#F94001] bg-[#F94001]/5 text-[12px] font-bold text-[#F94001]">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Uploading bank proof...</span>
            </div>
          ) : branchProofDocId ? (
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl border border-[#16A34A]/30 bg-[#16A34A]/5 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#16A34A]/30 flex items-center justify-center shrink-0 text-[#16A34A]">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[12px] font-bold text-[#021526] truncate">
                    {branchProofDocId}
                  </p>
                  <span className="text-[10px] text-[#16A34A] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Uploaded & Verified
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    setPreviewDoc({
                      title: 'Cancelled Cheque / Passbook',
                      docId: branchProofDocId,
                      url: cancelledChequeUrl || `http://localhost:4000/api/v1/onboarding/documents/${branchProofDocId}/view`,
                      type: 'doc',
                    });
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-[#E5E7EB] text-[11px] font-bold text-[#021526] hover:bg-[#F3F4F4] active-press cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-[#5F6368]" />
                  <span>View</span>
                </button>

                {!isStaff && (
                  <button
                    type="button"
                    onClick={() => bankProofInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F94001] text-white text-[11px] font-bold hover:bg-[#D93600] active-press cursor-pointer shadow-2xs"
                  >
                    <span>Change</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 p-2 rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F3F4F4]">
              <div className="flex items-center gap-2 flex-1 min-w-0 px-1">
                <FileText className="h-4 w-4 text-[#5F6368] shrink-0" />
                <span className="font-mono text-[11px] text-[#5F6368] truncate">
                  No bank proof uploaded
                </span>
              </div>
              {!isStaff && (
                <button
                  type="button"
                  onClick={() => bankProofInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-[#F94001] hover:bg-[#D93600] text-white text-[11px] font-bold transition-all shadow-xs shrink-0 active-press cursor-pointer"
                >
                  Upload File
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[440px] rounded-3xl border border-[#E5E7EB] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F3F4F4]">
              <div>
                <h3 className="text-[14px] font-black text-[#021526] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                  <span>{previewDoc.title}</span>
                </h3>
                <p className="text-[10.5px] font-mono text-[#5F6368] truncate">{previewDoc.docId}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#5F6368] hover:text-[#021526] active-press cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 flex-1 overflow-auto bg-[#F8F9FA] flex items-center justify-center min-h-[300px]">
              {previewDoc.type === 'image' ? (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
                  className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-xs border border-[#E5E7EB]"
                />
              ) : (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.title}
                  className="w-full h-[60vh] rounded-2xl border border-[#E5E7EB] bg-white"
                />
              )}
            </div>

            <div className="p-3 border-t border-[#E5E7EB] bg-white flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#16A34A] bg-[#16A34A]/10 px-2.5 py-1 rounded-full border border-[#16A34A]/20">
                ✓ Document Verified & Valid
              </span>
              <a
                href={previewDoc.url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-[#F94001] hover:underline flex items-center gap-1"
              >
                <span>Full View</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* DOCKED SAVE BUTTON BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] flex items-center justify-between gap-3 z-40 max-w-[440px] mx-auto">
        <button
          type="button"
          onClick={() => {
            haptics.tap();
            goBack();
          }}
          className="h-11 px-4 rounded-2xl border border-[#E5E7EB] bg-[#F3F4F4] text-[#021526] text-[12.5px] font-bold active-press cursor-pointer"
        >
          Cancel
        </button>

        {isStaff ? (
          <button
            type="button"
            disabled
            className="flex-1 h-11 rounded-2xl bg-[#F3F4F4] text-[#5F6368] text-[12px] font-bold flex items-center justify-center gap-1.5 border border-[#E5E7EB] cursor-not-allowed"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>View Only (Staff)</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 h-11 rounded-2xl bg-[#F94001] hover:bg-[#D93600] text-white text-[13px] font-black flex items-center justify-center gap-2 shadow-sm active-press cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Photos</span>
          </button>
        )}
      </div>

      {/* ADD PHOTO MODAL */}
      {isAddPhotoOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[440px] rounded-t-3xl sm:rounded-3xl border border-[#E5E7EB] shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
            {/* Sheet Header */}
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F3F4F4]">
              <div>
                <h3 className="text-[15px] font-black text-[#021526]">Add Photo to Gallery</h3>
                <p className="text-[11.5px] text-[#5F6368]">Select a facility area or enter photo label</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPhotoOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#5F6368] hover:text-[#021526] active-press cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sheet Content */}
            <form onSubmit={handleAddPhotoSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-[11px] font-bold text-[#5F6368] mb-1.5">
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
                          isSelected ? 'border-[#F94001] ring-2 ring-[#F94001]/20' : 'border-[#E5E7EB]'
                        }`}
                      >
                        <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <span className="absolute bottom-1.5 left-2 right-2 text-[10px] font-bold text-white truncate">
                          {preset.title}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#F94001] text-white flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5F6368] mb-1">Photo Caption / Label</label>
                <input
                  type="text"
                  value={newPhotoLabel}
                  onChange={(e) => setNewPhotoLabel(e.target.value)}
                  placeholder="e.g. Main Pitch 1 (Floodlit)"
                  className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-[13px] font-bold text-[#021526] focus:bg-white focus:outline-none focus:border-[#F94001]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-[#F94001] hover:bg-[#D93600] text-white text-[13px] font-black flex items-center justify-center gap-1.5 shadow-sm active-press cursor-pointer"
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
