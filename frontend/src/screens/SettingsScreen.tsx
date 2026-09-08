import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Grid3X3,
  Coffee,
  Clock,
  SlidersHorizontal,
  Wallet,
  HelpCircle,
  LifeBuoy,
  ChevronRight,
  ChevronLeft,
  LogOut,
  FileSpreadsheet,
  Shield,
  FileText,
  Building2,
  CheckCircle2,
  Zap,
  ShowerHead,
  Droplets,
  Car,
  Shirt,
  Trophy,
  HeartPulse,
  SunMedium,
  DoorOpen,
  Armchair,
  ShieldCheck,
  Save,
  Bell,
  Mail,
  Phone,
  Check,
  Plus,
  X,
  Trash2,
  Upload,
  AlertCircle,
  Lock,
  Building,
  CreditCard,
  ArrowRight,
  Image as ImageIcon,
  MapPin,
  Eye,
  ExternalLink,
  Loader2,
  Landmark,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';

type SettingsTab =
  | 'general'
  | 'amenities'
  | 'operating_hours'
  | 'booking_settings'
  | 'payment_settings'
  | 'notifications'
  | 'privacy'
  | 'terms';

const SETTINGS_TIME_OPTIONS = [
  '05:00 AM', '05:30 AM', '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM',
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
  '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM',
  '11:00 PM', '11:30 PM', '12:00 AM',
];

export const SettingsScreen: React.FC = () => {
  const {
    ownerPhone,
    ownerName,
    ownerEmail,
    ownerPan,
    venueName,
    venueAddress,
    venueCity,
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
    venuePhotos,
    setVenuePhotos,
    setVenueDetails,
    bankDetails,
    updateBankDetails,
    syncVendorProfileToBackend,
    syncBankChangeToBackend,
    isLoadingOnboardingProfile,
    refreshFromOnboarding,
    amenities,
    toggleAmenity,
    addAmenity,
    operatingHours,
    toggleOperatingDay,
    updateOperatingDayHours,
    bookingSettings,
    updateBookingSettings,
    paymentSettings,
    updatePaymentSettings,
    notificationPreferences,
    updateNotificationPreferences,
    cancellationPolicy,
    updateCancellationPolicy,
    courts,
    showToast,
    setActiveModal,
    currentUser,
    navigateTo,
  } = useApp();

  const isStaff = currentUser?.type === 'staff';

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isMobileGeneralOpen, setIsMobileGeneralOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ==========================================
  // VENUE & OWNER PROFILE STATE
  // ==========================================
  const [vName, setVName] = useState(venueName || 'skywalk sports');
  const [vCity, setVCity] = useState(venueCity || 'Coimbatore, Tamil Nadu');
  const [vAddress, setVAddress] = useState(venueAddress || 'skywalk sports, Coimbatore, Tamil Nadu');
  const [vPincode, setVPincode] = useState(venuePincode || '639004');
  const [vEstablished, setVEstablished] = useState(venueEstablished || '2023');
  const [vDescription, setVDescription] = useState(
    venueDescription || 'Premier synthetic turf and multi-sport arena with verified lighting and player amenities.'
  );
  const [vGoogleMaps, setVGoogleMaps] = useState(venueGoogleMapsLink || 'https://maps.app.goo.gl/uyJgU4DB7ushZsiv6');

  // Owner details
  const [oName, setOName] = useState(ownerName || 'Shruthi jayamadhu');
  const [oPhone, setOPhone] = useState(ownerPhone || '+91 6369591821');
  const [oEmail, setOEmail] = useState(ownerEmail || 'yutekahema003@gmail.com');
  const [oPan, setOPan] = useState(ownerPan || '33ABCDE1234F1Z5');

  // Documents & Bank Proof
  const [aadhaarDocId, setAadhaarDocId] = useState(ownerAadhaarDocId || 'doc_aadhaar_shruthi');
  const [aadhaarUrl, setAadhaarUrl] = useState(ownerAadhaarUrl || 'http://localhost:4000/api/v1/onboarding/documents/doc_aadhaar_shruthi/view');
  const [profilePhotoDocId, setProfilePhotoDocId] = useState(ownerProfilePhotoDocId || 'doc_profile_shruthi');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(ownerProfilePhotoUrl || 'http://localhost:4000/api/v1/onboarding/documents/doc_profile_shruthi/view');
  const [branchProofDocId, setBranchProofDocId] = useState(bankBranchProofDocId || 'doc_bank_proof_1788778055198');
  const [cancelledChequeUrl, setCancelledChequeUrl] = useState(bankCancelledChequeUrl || 'http://localhost:4000/api/v1/onboarding/documents/doc_bank_proof_1788778055198/view');

  const [previewDoc, setPreviewDoc] = useState<{ title: string; docId: string; url: string; type: 'image' | 'doc' } | null>(null);

  const aadhaarInputRef = React.useRef<HTMLInputElement>(null);
  const profilePhotoInputRef = React.useRef<HTMLInputElement>(null);
  const bankProofInputRef = React.useRef<HTMLInputElement>(null);

  // Sync state whenever AppContext updates from backend onboarding
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

  const [newPhotoLabel, setNewPhotoLabel] = useState('');
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);

  // ==========================================
  // PAYMENT SETTINGS & BANK DETAILS STATE
  // ==========================================
  const [activeBankDetails, setActiveBankDetails] = useState({
    bankName: 'HDFC Bank',
    accountHolder: 'Dhanush Kumar (TurfTown Arena)',
    accountNumber: '50200088921456',
    maskedNumber: '•••• •••• •••• 8892',
    ifsc: 'HDFC0001234',
    accountType: 'Current Commercial Account',
    payoutSchedule: 'T+0 Auto IMPS Midnight Direct Settlement',
    status: 'Verified & Active',
  });

  const [bankChangeRequest, setBankChangeRequest] = useState<{
    pending: boolean;
    requestId?: string;
    newBankName?: string;
    newAccountMasked?: string;
    newIfsc?: string;
    submittedAt?: string;
  } | null>(null);

  const [isBankChangeModalOpen, setIsBankChangeModalOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newHolderName, setNewHolderName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [newIfsc, setNewIfsc] = useState('');
  const [newAccountType, setNewAccountType] = useState('Current Commercial');
  const [changeReason, setChangeReason] = useState('');
  const [hasChequeAttached, setHasChequeAttached] = useState(false);

  // Amenities state
  const [amenityFilter, setAmenityFilter] = useState<string>('all');
  const activeAmenitiesCount = amenities.filter((a) => a.enabled).length;



  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

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

  // Handle Venue Profile Save & Sync to Onboarding Database
  const handleSaveVenueProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStaff) {
      showToast('View Only Mode', 'Only the venue owner can modify venue profile settings.', 'info');
      return;
    }
    if (venuePhotos.length < 4) {
      showToast('Photos Required', 'Please maintain at least 4 photos for verification.', 'warning');
      return;
    }
    setIsSaving(true);
    haptics.tap();

    const updated = {
      venueName: vName.trim(),
      venueCity: vCity.trim(),
      venueAddress: vAddress.trim(),
      venuePincode: vPincode.trim(),
      ownerPhone: oPhone.trim(),
      ownerName: oName.trim(),
      ownerEmail: oEmail.trim(),
      ownerPan: oPan.trim(),
      venueEstablished: vEstablished.trim(),
      venueDescription: vDescription.trim(),
      venueGoogleMapsLink: vGoogleMaps.trim(),
      ownerAadhaarDocId: aadhaarDocId,
      ownerAadhaarUrl: aadhaarUrl,
      ownerProfilePhotoDocId: profilePhotoDocId,
      ownerProfilePhotoUrl: profilePhotoUrl,
      bankBranchProofDocId: branchProofDocId,
      bankCancelledChequeUrl: cancelledChequeUrl,
    };

    setVenueDetails(updated);

    const cleanPhone = oPhone.replace(/\D/g, '').slice(-10);
    const success = await syncVendorProfileToBackend({
      owner: {
        name: oName.trim(),
        mobile: cleanPhone,
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
        bank_name: bankDetails.bankName,
        account_holder_name: bankDetails.accountHolder,
        account_number: bankDetails.accountNumber,
        ifsc_code: bankDetails.ifsc,
        branch_name: bankDetails.branchName,
        account_type: bankDetails.accountType.replace(/ commercial account/i, '').trim(),
        branch_proof_document_id: branchProofDocId,
      },
    });

    setIsSaving(false);
    haptics.success();
    if (success) {
      showToast(
        'Profile Synchronized',
        'Owner details, venue info & photos updated and saved to onboarding records.',
        'success'
      );
    } else {
      showToast('Profile Saved Locally', 'Details updated locally in vendor system.', 'info');
    }
  };

  // Add Photo Handler
  const handleAddPhoto = () => {
    if (venuePhotos.length >= 8) {
      showToast('Maximum Reached', 'You can upload up to 8 photos maximum.', 'info');
      return;
    }
    const samplePool = [
      'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    ];
    const nextUrl = samplePool[venuePhotos.length % samplePool.length];
    const newId = `p${Date.now()}`;
    const label = newPhotoLabel.trim() || `Facility Area ${venuePhotos.length + 1}`;

    setVenuePhotos([...venuePhotos, { id: newId, url: nextUrl, label }]);
    setNewPhotoLabel('');
    setIsAddPhotoOpen(false);
    haptics.success();
    showToast('Photo Added', `${label} added to venue gallery.`, 'success');
  };

  // Remove Photo Handler
  const handleRemovePhoto = (id: string) => {
    haptics.tap();
    if (venuePhotos.length <= 4) {
      showToast('Minimum Required', 'Minimum 4 photos required for active verification.', 'warning');
      return;
    }
    setVenuePhotos(venuePhotos.filter((p) => p.id !== id));
    showToast('Photo Removed', 'Photo removed from gallery.', 'info');
  };

  // Handle Bank Change Request
  const handleSubmitBankChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccountNumber !== confirmAccountNumber) {
      showToast('Account Mismatch', 'Account numbers do not match.', 'warning');
      return;
    }
    if (!newIfsc.trim() || newIfsc.length < 5) {
      showToast('Invalid IFSC', 'Please enter a valid IFSC code.', 'warning');
      return;
    }

    haptics.tap();
    const masked = `•••• •••• •••• ${newAccountNumber.slice(-4)}`;
    const reqId = `REQ-BNK-${Math.floor(1000 + Math.random() * 9000)}`;

    await syncBankChangeToBackend({
      bankName: newBankName,
      accountHolder: newHolderName || oName,
      accountNumber: newAccountNumber,
      ifsc: newIfsc.toUpperCase(),
      branchName: 'Main Branch',
      accountType: newAccountType,
    });

    setBankChangeRequest({
      pending: true,
      requestId: reqId,
      newBankName,
      newAccountMasked: masked,
      newIfsc: newIfsc.toUpperCase(),
      submittedAt: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setIsBankChangeModalOpen(false);
    haptics.success();
    showToast('Change Request Submitted', 'Sent to admin and synced to onboarding records.', 'success');
  };

  // Nav menu items (Staff Management and Cancellation & Refunds REMOVED)
  // Payment Settings also hidden from staff users
  const navItems: { id: SettingsTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'general', label: 'Venue Profile & Info', icon: Building2, badge: `${venuePhotos.length} Photos` },
    ...(!isStaff ? [{ id: 'payment_settings' as SettingsTab, label: 'Payment Settings', icon: Wallet, badge: bankChangeRequest?.pending ? 'Pending' : 'Bank Verified' }] : []),
    { id: 'amenities', label: 'Amenities', icon: Coffee, badge: `${activeAmenitiesCount} on` },
    { id: 'operating_hours', label: 'Operating Hours', icon: Clock, badge: 'Daily' },
    { id: 'booking_settings', label: 'Booking Settings', icon: SlidersHorizontal },
    { id: 'notifications', label: 'Notification Settings', icon: Bell, badge: 'On/Off' },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
  ];

  const getAmenityIcon = (iconName: string) => {
    switch (iconName) {
      case 'SunMedium':
      case 'Zap':
        return <SunMedium className="w-4 h-4 text-[#FF6B2C]" />;
      case 'ShowerHead':
      case 'DoorOpen':
        return <DoorOpen className="w-4 h-4 text-[#2FA66A]" />;
      case 'Droplets':
        return <Droplets className="w-4 h-4 text-[#3B82F6]" />;
      case 'Car':
        return <Car className="w-4 h-4 text-[#8B5CF6]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-[#6366F1]" />;
      case 'Armchair':
        return <Armchair className="w-4 h-4 text-[#EC4899]" />;
      case 'HeartPulse':
        return <HeartPulse className="w-4 h-4 text-[#EF4444]" />;
      case 'Coffee':
        return <Coffee className="w-4 h-4 text-[#F59E0B]" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-[#777570]" />;
    }
  };

  return (
    <div className="pb-20 pt-1 w-full space-y-4 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E8E6E1]">
        <div>
          <h1 className="text-[21px] font-black text-[#171717] tracking-tight">
            Settings & Operations
          </h1>
          <p className="text-[12px] font-medium text-[#777570]">
            Venue profile, verified bank accounts, amenities & booking rules
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => {
              haptics.tap();
              navigateTo('courts');
            }}
            className="h-8.5 px-3.5 rounded-xl bg-white border border-[#E8E6E1] text-[12px] font-bold text-[#171717] hover:bg-[#F7F7F5] active-press cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Grid3X3 className="w-3.5 h-3.5 text-[#FF6B2C]" />
            <span>Manage Courts</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MOBILE VIEW (md:hidden): Fast, clean tap-friendly vertical menu        */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-3">
        {/* Venue Owner Mini Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B2C] text-white font-extrabold text-base flex items-center justify-center">
              TT
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#171717]">{venueName}</h2>
              <p className="text-[11px] text-[#777570]">{venueCity} · Owner: {oName}</p>
            </div>
          </div>
          <button
            onClick={() => {
              haptics.tap();
              navigateTo('courts');
            }}
            className="text-[11px] font-bold text-[#FF6B2C] bg-[#FF6B2C]/10 px-2.5 py-1 rounded-lg"
          >
            Courts
          </button>
        </div>

        {/* Mobile Rows List (Staff & Cancellation REMOVED) */}
        <div className="space-y-2">
          {[
            { id: 'general', title: 'Venue Profile & Photos', caption: `Owner details & ${venuePhotos.length} photos`, icon: Building2, screen: 'venue_profile' as const },
            ...(!isStaff ? [{ id: 'payment_settings', title: 'Payment & Bank Details', caption: 'HDFC verified payout · Change request form', icon: Wallet, screen: 'payment_settings' as const }] : []),
            { id: 'amenities', title: 'Amenities', caption: `${activeAmenitiesCount} active · Admin verified amenities`, icon: Coffee, screen: 'amenities' as const },
            { id: 'operating_hours', title: 'Operating Hours', caption: `${operatingHours.filter((d) => d.isOpen).length}/7 Days Open · Onboarding Schedule`, icon: Clock, screen: 'operating_hours' as const },
            { id: 'booking_settings', title: 'Booking Settings', caption: 'Advance reservation & slot duration', icon: SlidersHorizontal, screen: 'booking_settings' as const },
            { id: 'notifications', title: 'Notification Settings', caption: 'WhatsApp & SMS alerts on/off toggles', icon: Bell, screen: 'notification_settings' as const },
            { id: 'privacy', title: 'Privacy Policy', caption: 'Rich text data protection & compliance', icon: Shield, screen: 'privacy_policy' as const },
            { id: 'terms', title: 'Terms & Conditions', caption: 'Platform rules & rights', icon: FileText, screen: 'terms_conditions' as const },
            { id: 'reports', title: 'Export Booking Reports', caption: 'Day, month & custom statements', icon: FileSpreadsheet, screen: 'export_report' as const },
            { id: 'help_faq', title: 'Help & FAQ', caption: 'Knowledge base, guides & self-serve answers', icon: HelpCircle, screen: 'help_faq' as const },
            { id: 'support', title: 'Support & Tickets', caption: 'Raise query, view ticket statuses & hotline', icon: LifeBuoy, screen: 'support' as const },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => {
                  haptics.tap();
                  navigateTo(item.screen);
                }}
                className="p-3.5 bg-white rounded-2xl border border-[#E8E6E1] shadow-2xs flex items-center justify-between active-press cursor-pointer hover:bg-[#FAF9F6] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF9F6] text-[#171717] flex items-center justify-center border border-[#E8E6E1]">
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-[#171717]">{item.title}</h3>
                    <p className="text-[11px] text-[#777570]">{item.caption}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#777570]" />
              </div>
            );
          })}
        </div>

        {/* Sign out */}
        <button
          onClick={() => {
            haptics.tap();
            setActiveModal('logout_confirm');
          }}
          className="w-full py-2.5 bg-white text-[#D94B4B] border border-[#E8E6E1] rounded-2xl font-bold text-[12.5px] flex items-center justify-center gap-1.5 active-press cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Switch Account / Sign Out</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP VIEW (hidden md:flex): Nav-Based State-of-the-Art SaaS Layout */}
      {/* ========================================================================= */}
      <div className="hidden md:flex gap-5 items-start">
        {/* Left Navigation Sidebar */}
        <div className="w-64 shrink-0 space-y-2">
          {/* Venue Info Card */}
          <div className="bg-white rounded-2xl p-3 border border-[#E8E6E1] shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF6B2C] text-white font-extrabold text-sm flex items-center justify-center shrink-0">
              TT
            </div>
            <div className="min-w-0">
              <h2 className="text-[13.5px] font-bold text-[#171717] truncate">{venueName}</h2>
              <p className="text-[10.5px] text-[#777570] truncate">{venueCity} · Owner: {oName}</p>
            </div>
          </div>

          {/* Navigation Tabs List (Staff & Cancellation REMOVED) */}
          <div className="bg-white rounded-2xl p-2 border border-[#E8E6E1] shadow-2xs space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    setActiveTab(item.id);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-[12.5px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#171717] text-white shadow-xs'
                      : 'text-[#55534E] hover:bg-[#FAF9F6] hover:text-[#171717]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6B2C]' : 'text-[#777570]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9.5px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badge === 'Pending'
                          ? 'bg-[#E7A72F]/15 text-[#B87C0D]'
                          : 'bg-[#FAF9F6] text-[#777570] border border-[#E8E6E1]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sign Out */}
          <button
            onClick={() => {
              haptics.tap();
              setActiveModal('logout_confirm');
            }}
            className="w-full py-2 bg-white text-[#D94B4B] hover:bg-[#D94B4B]/10 border border-[#E8E6E1] rounded-xl font-bold text-[11.5px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Right Active Content Panel */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl p-5 border border-[#E8E6E1] shadow-2xs">
          {/* Hidden File Inputs for Document Verification Updates */}
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

          {/* ===================================================================== */}
          {/* TAB 1: VENUE PROFILE & OWNER DETAILS & PHOTO GALLERY (Min 4, Max 8)   */}
          {/* ===================================================================== */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveVenueProfile} className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F0EC]">
                <div>
                  <h3 className="text-[17px] font-black text-[#171717]">Venue & Owner Profile</h3>
                  <p className="text-[11.5px] text-[#777570]">
                    Verified owner credentials, business details & verified photo gallery
                  </p>
                </div>

                {isStaff ? (
                  <div className="h-8.5 px-3.5 rounded-xl bg-[#F1F0EC] text-[#777570] font-bold text-[12px] flex items-center gap-1.5 border border-[#E8E6E1]">
                    <Lock className="w-3.5 h-3.5" />
                    <span>View Only (Staff)</span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="h-8.5 px-4 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-bold text-[12px] flex items-center gap-1.5 shadow-sm active-press cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save All Changes</span>
                  </button>
                )}
              </div>

              {/* SECTION A: OWNER DETAILS */}
              <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#E8E6E1] space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-[#E8E6E1]/70">
                  <h4 className="text-[13px] font-black text-[#171717] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2FA66A]" />
                    <span>Owner / Licensee Details</span>
                  </h4>
                  <span className="text-[10px] font-bold text-[#2FA66A] bg-[#2FA66A]/10 px-2 py-0.5 rounded-full">
                    KYC Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      Owner Full Name <span className="text-[#FF6B2C]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isStaff}
                      value={oName}
                      onChange={(e) => setOName(e.target.value)}
                      className="w-full bg-white disabled:bg-[#F1F0EC] disabled:text-[#777570] disabled:cursor-not-allowed border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      Registered Mobile Phone <span className="text-[#FF6B2C]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isStaff}
                      value={oPhone}
                      onChange={(e) => setOPhone(e.target.value)}
                      className="w-full bg-white disabled:bg-[#F1F0EC] disabled:text-[#777570] disabled:cursor-not-allowed border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">Owner Email Address</label>
                    <input
                      type="email"
                      required
                      disabled={isStaff}
                      value={oEmail}
                      onChange={(e) => setOEmail(e.target.value)}
                      className="w-full bg-white disabled:bg-[#F1F0EC] disabled:text-[#777570] disabled:cursor-not-allowed border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">PAN / Government ID</label>
                    <input
                      type="text"
                      disabled={isStaff}
                      value={oPan}
                      onChange={(e) => setOPan(e.target.value)}
                      className="w-full bg-white disabled:bg-[#F1F0EC] disabled:text-[#777570] disabled:cursor-not-allowed border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none uppercase"
                    />
                  </div>

                  {/* AADHAAR CARD DOCUMENT */}
                  <div className="sm:col-span-1">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-[#777570]">
                        Aadhaar Card Document <span className="text-[#FF6B2C]">*</span>
                      </label>
                      <span className="text-[9.5px] font-mono text-[#777570] uppercase">PDF/JPG MAX 5MB</span>
                    </div>

                    {uploadingDoc === 'AADHAAR' ? (
                      <div className="flex items-center gap-2 p-2 rounded-xl border border-dashed border-[#FF6B2C] bg-[#FF6B2C]/5 text-[11.5px] font-bold text-[#FF6B2C]">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Uploading Aadhaar document...</span>
                      </div>
                    ) : aadhaarDocId ? (
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl border border-[#2FA66A]/30 bg-white shadow-2xs">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-lg bg-[#2FA66A]/10 border border-[#2FA66A]/20 flex items-center justify-center shrink-0 text-[#2FA66A]">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-[11.5px] font-bold text-[#171717] truncate">
                              {aadhaarDocId}
                            </p>
                            <span className="text-[9.5px] text-[#2FA66A] font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Uploaded & Verified
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
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FAF9F6] border border-[#E8E6E1] text-[10.5px] font-bold text-[#171717] hover:bg-[#F1F0EC] active-press cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-[#777570]" />
                            <span>View</span>
                          </button>

                          {!isStaff && (
                            <button
                              type="button"
                              onClick={() => aadhaarInputRef.current?.click()}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FF6B2C] text-white text-[10.5px] font-bold hover:bg-[#e85b1e] active-press cursor-pointer"
                            >
                              <span>Change</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl border border-dashed border-[#CBD5E1] bg-white">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0 px-1">
                          <FileText className="h-3.5 w-3.5 text-[#777570] shrink-0" />
                          <span className="font-mono text-[11px] text-[#777570] truncate">No Aadhaar attached</span>
                        </div>
                        {!isStaff && (
                          <button
                            type="button"
                            onClick={() => aadhaarInputRef.current?.click()}
                            className="px-2.5 py-1 rounded-lg bg-[#FF6B2C] hover:bg-[#e85b1e] text-white text-[10.5px] font-bold transition-all shadow-xs shrink-0 active-press cursor-pointer"
                          >
                            Upload
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* PROFILE PHOTO ID */}
                  <div className="sm:col-span-1">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-[#777570]">
                        Profile Photo ID <span className="text-[#FF6B2C]">*</span>
                      </label>
                      <span className="text-[9.5px] font-mono text-[#777570] uppercase">JPG/PNG MAX 5MB</span>
                    </div>

                    {uploadingDoc === 'PROFILE_PHOTO' ? (
                      <div className="flex items-center gap-2 p-2 rounded-xl border border-dashed border-[#FF6B2C] bg-[#FF6B2C]/5 text-[11.5px] font-bold text-[#FF6B2C]">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Uploading profile photo...</span>
                      </div>
                    ) : profilePhotoDocId ? (
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl border border-[#2FA66A]/30 bg-white shadow-2xs">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-[#2FA66A]/30 bg-white">
                            {profilePhotoUrl ? (
                              <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-[#2FA66A] m-auto" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-[11.5px] font-bold text-[#171717] truncate">
                              {profilePhotoDocId}
                            </p>
                            <span className="text-[9.5px] text-[#2FA66A] font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Uploaded & Verified
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
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FAF9F6] border border-[#E8E6E1] text-[10.5px] font-bold text-[#171717] hover:bg-[#F1F0EC] active-press cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-[#777570]" />
                            <span>View</span>
                          </button>

                          {!isStaff && (
                            <button
                              type="button"
                              onClick={() => profilePhotoInputRef.current?.click()}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FF6B2C] text-white text-[10.5px] font-bold hover:bg-[#e85b1e] active-press cursor-pointer"
                            >
                              <span>Change</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl border border-dashed border-[#CBD5E1] bg-white">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0 px-1">
                          <ImageIcon className="h-3.5 w-3.5 text-[#777570] shrink-0" />
                          <span className="font-mono text-[11px] text-[#777570] truncate">No photo attached</span>
                        </div>
                        {!isStaff && (
                          <button
                            type="button"
                            onClick={() => profilePhotoInputRef.current?.click()}
                            className="px-2.5 py-1 rounded-lg bg-[#FF6B2C] hover:bg-[#e85b1e] text-white text-[10.5px] font-bold transition-all shadow-xs shrink-0 active-press cursor-pointer"
                          >
                            Upload
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION B: VENUE DETAILS */}
              <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#E8E6E1] space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-[#E8E6E1]/70">
                  <h4 className="text-[13px] font-black text-[#171717] uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#FF6B2C]" />
                    <span>Venue & Arena Information</span>
                  </h4>
                  <span className="text-[10px] font-bold text-[#FF6B2C] bg-[#FF6B2C]/10 px-2 py-0.5 rounded-full">
                    Customer-Facing
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      Venue Name <span className="text-[#FF6B2C]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isStaff}
                      value={vName}
                      onChange={(e) => setVName(e.target.value)}
                      className="w-full bg-white disabled:bg-[#F1F0EC] disabled:text-[#777570] disabled:cursor-not-allowed border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">City / Region</label>
                    <input
                      type="text"
                      required
                      disabled={isStaff}
                      value={vCity}
                      onChange={(e) => setVCity(e.target.value)}
                      className="w-full bg-white disabled:bg-[#F1F0EC] disabled:text-[#777570] disabled:cursor-not-allowed border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">Physical Address</label>
                    <input
                      type="text"
                      required
                      disabled={isStaff}
                      value={vAddress}
                      onChange={(e) => setVAddress(e.target.value)}
                      className="w-full bg-white disabled:bg-[#F1F0EC] disabled:text-[#777570] disabled:cursor-not-allowed border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none"
                    />
                  </div>

                  {/* GOOGLE MAPS LOCATION LINK */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-[#777570]">
                        Google Maps Location Link <span className="text-[#FF6B2C]">*</span>
                      </label>
                      {vGoogleMaps && (
                        <a
                          href={vGoogleMaps}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10.5px] font-bold text-[#FF6B2C] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open Map</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 text-[#FF6B2C] pointer-events-none">
                        <MapPin className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <input
                        type="url"
                        disabled={isStaff}
                        value={vGoogleMaps}
                        onChange={(e) => setVGoogleMaps(e.target.value)}
                        placeholder="https://maps.app.goo.gl/..."
                        className="w-full bg-white disabled:bg-[#F1F0EC] disabled:text-[#777570] disabled:cursor-not-allowed border border-[#E8E6E1] rounded-xl pl-9 pr-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">About the Arena (Public Bio)</label>
                    <textarea
                      rows={2}
                      disabled={isStaff}
                      value={vDescription}
                      onChange={(e) => setVDescription(e.target.value)}
                      className="w-full bg-white disabled:bg-[#F1F0EC] disabled:text-[#777570] disabled:cursor-not-allowed border border-[#E8E6E1] rounded-xl p-2.5 text-[12.5px] font-medium text-[#171717] focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION C: VENUE PHOTOS GALLERY (MIN 4, MAX 8) */}
              <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-[#F1F0EC]">
                  <div>
                    <h4 className="text-[14px] font-black text-[#171717] flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#FF6B2C]" />
                      <span>Venue Photo Gallery</span>
                      <span className="text-[11px] font-normal text-[#777570]">(Min 4, Max 8 Photos)</span>
                    </h4>
                    <p className="text-[11px] text-[#777570]">
                      High-resolution photos displayed to players on the TurfTown public booking app
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        venuePhotos.length >= 4 && venuePhotos.length <= 8
                          ? 'bg-[#2FA66A]/10 text-[#2FA66A]'
                          : 'bg-[#E7A72F]/15 text-[#B87C0D]'
                      }`}
                    >
                      {venuePhotos.length} / 8 Photos Uploaded
                    </span>

                    {venuePhotos.length < 8 && !isStaff && (
                      <button
                        type="button"
                        onClick={() => setIsAddPhotoOpen(true)}
                        className="h-7 px-2.5 rounded-lg bg-[#171717] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Photo</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Photos Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {venuePhotos.map((p, idx) => (
                    <div
                      key={p.id}
                      className="group relative rounded-xl overflow-hidden border border-[#E8E6E1] bg-[#FAF9F6] aspect-4/3 flex flex-col justify-end"
                    >
                      <img
                        src={p.url}
                        alt={p.label}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                      {/* Photo Label */}
                      <div className="relative z-10 p-2 text-white">
                        <span className="text-[10px] font-bold block leading-tight truncate">{p.label}</span>
                        <span className="text-[8.5px] text-white/70">Photo {idx + 1}</span>
                      </div>

                      {/* Delete button (only for owner) */}
                      {!isStaff && (
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(p.id)}
                          className="absolute top-1.5 right-1.5 z-20 w-6 h-6 rounded-full bg-black/60 hover:bg-[#D94B4B] text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Remove Photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add Placeholder card if < 8 and owner */}
                  {venuePhotos.length < 8 && !isStaff && (
                    <button
                      type="button"
                      onClick={() => setIsAddPhotoOpen(true)}
                      className="rounded-xl border-2 border-dashed border-[#E8E6E1] hover:border-[#FF6B2C] bg-[#FAF9F6] hover:bg-white aspect-4/3 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-[#777570] hover:text-[#FF6B2C]"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-[11px] font-bold">Add Photo</span>
                      <span className="text-[9px] text-[#A3A099]">Up to 8 max</span>
                    </button>
                  )}
                </div>

                {/* Validation Notice */}
                <div className="pt-1 flex items-center justify-between text-[11px] text-[#777570]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2FA66A]" />
                    <span>Photos are checked against ground markings and floodlight standards.</span>
                  </span>
                  <span className="font-bold text-[#171717]">Min: 4 · Max: 8</span>
                </div>
              </div>

              {/* SECTION D: FINANCIAL SETTLEMENTS & BANK ACCOUNT PROOF */}
              <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#E8E6E1] space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-[#E8E6E1]/70">
                  <h4 className="text-[13px] font-black text-[#171717] uppercase tracking-wider flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-[#FF6B2C]" />
                    <span>Settlement Bank Account & Verification Proof</span>
                  </h4>
                  <span className="text-[10px] font-bold text-[#2FA66A] bg-[#2FA66A]/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#2FA66A]/20">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified Payouts</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Bank Account Info Card */}
                  <div className="bg-white rounded-xl p-3 border border-[#E8E6E1] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#777570]">Active Settlement Account</span>
                      <span className="text-[10px] font-bold text-[#2FA66A] bg-[#2FA66A]/10 px-2 py-0.5 rounded-full">
                        IMPS T+0 Active
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11.5px] pt-1 border-t border-[#F1F0EC]">
                      <div>
                        <span className="block text-[10px] text-[#777570] font-bold">Bank Name</span>
                        <span className="font-bold text-[#171717]">{bankDetails.bankName || 'HDFC Bank'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-[#777570] font-bold">Account Holder</span>
                        <span className="font-bold text-[#171717] truncate block">{bankDetails.accountHolder || oName}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-[#777570] font-bold">Account Number</span>
                        <span className="font-mono font-bold text-[#171717]">{bankDetails.maskedNumber || '•••• •••• •••• 8892'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-[#777570] font-bold">IFSC Code</span>
                        <span className="font-mono font-bold text-[#171717]">{bankDetails.ifsc || 'HDFC0001234'}</span>
                      </div>
                    </div>
                  </div>

                  {/* CANCELLED CHEQUE / PASSBOOK DOCUMENT CARD */}
                  <div className="bg-white rounded-xl p-3 border border-[#E8E6E1] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-[#777570]">
                          Cancelled Cheque / Passbook <span className="text-[#FF6B2C]">*</span>
                        </label>
                        <span className="text-[9.5px] font-mono text-[#777570] uppercase">PDF/JPG MAX 5MB</span>
                      </div>
                      <p className="text-[10.5px] text-[#777570] mb-2">
                        Official bank proof submitted during onboarding for IMPS automated settlements.
                      </p>
                    </div>

                    {uploadingDoc === 'BANK_PROOF' ? (
                      <div className="flex items-center gap-2 p-2 rounded-xl border border-dashed border-[#FF6B2C] bg-[#FF6B2C]/5 text-[11.5px] font-bold text-[#FF6B2C]">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Uploading bank proof...</span>
                      </div>
                    ) : branchProofDocId ? (
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl border border-[#2FA66A]/30 bg-[#2FA66A]/5">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-lg bg-white border border-[#2FA66A]/30 flex items-center justify-center shrink-0 text-[#2FA66A]">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-[11.5px] font-bold text-[#171717] truncate">
                              {branchProofDocId}
                            </p>
                            <span className="text-[9.5px] text-[#2FA66A] font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Uploaded & Verified
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
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-[#E8E6E1] text-[10.5px] font-bold text-[#171717] hover:bg-[#FAF9F6] active-press cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3 h-3 text-[#777570]" />
                            <span>View</span>
                          </button>

                          {!isStaff && (
                            <button
                              type="button"
                              onClick={() => bankProofInputRef.current?.click()}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FF6B2C] text-white text-[10.5px] font-bold hover:bg-[#e85b1e] active-press cursor-pointer shadow-2xs"
                            >
                              <span>Change</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl border border-dashed border-[#CBD5E1] bg-[#FAF9F6]">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0 px-1">
                          <FileText className="h-3.5 w-3.5 text-[#777570] shrink-0" />
                          <span className="font-mono text-[11px] text-[#777570] truncate">No bank proof uploaded</span>
                        </div>
                        {!isStaff && (
                          <button
                            type="button"
                            onClick={() => bankProofInputRef.current?.click()}
                            className="px-2.5 py-1 rounded-lg bg-[#FF6B2C] hover:bg-[#e85b1e] text-white text-[10.5px] font-bold transition-all shadow-xs shrink-0 active-press cursor-pointer"
                          >
                            Upload
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: PAYMENT SETTINGS & BANK DETAILS WITH CHANGE REQUEST FORM       */}
          {/* ===================================================================== */}
          {activeTab === 'payment_settings' && (
            <div className="space-y-5">
              <div className="pb-2 border-b border-[#F1F0EC]">
                <h3 className="text-[17px] font-black text-[#171717]">Payment Methods & Bank Settlement</h3>
                <p className="text-[11.5px] text-[#777570]">
                  Verified settlement bank account, payout switch, UPI QR & cash collections
                </p>
              </div>

              {/* ACTIVE SETTLEMENT BANK ACCOUNT */}
              <div className="bg-[#171717] rounded-3xl p-5 border border-[#171717] space-y-4 shadow-md">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#A3A099] block">Settlement Account</span>
                      <span className="text-[17px] font-black text-white tracking-tight">{paymentSettings.bankName}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-[#2FA66A]/20 text-[#2FA66A] border border-[#2FA66A]/30 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified & Active
                  </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-3 gap-3 bg-white/8 rounded-2xl p-3.5">
                  <div>
                    <span className="text-[10px] font-bold block text-[#A3A099] mb-0.5">Account No.</span>
                    <span className="text-[13px] font-mono font-black text-white">{paymentSettings.accountNumberMasked}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold block text-[#A3A099] mb-0.5">IFSC</span>
                    <span className="text-[13px] font-mono font-black text-white">{paymentSettings.ifscCode}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold block text-[#A3A099] mb-0.5">Type</span>
                    <span className="text-[12px] font-bold text-white">Current A/C</span>
                  </div>
                  <div className="col-span-3 border-t border-white/10 pt-2.5 mt-0.5">
                    <span className="text-[10px] font-bold block text-[#A3A099] mb-0.5">Account Holder</span>
                    <span className="text-[12.5px] font-bold text-white">Dhanush Kumar (TurfTown Arena)</span>
                  </div>
                </div>

                {/* Settlement info */}
                <div className="flex items-center justify-between pt-1 border-t border-white/10">
                  <span className="text-[11px] font-bold text-[#2FA66A] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    T+0 Auto IMPS · Midnight Direct Settlement
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: AMENITIES (Full Editing & Toggle Controls)                    */}
          {/* ===================================================================== */}
          {activeTab === 'amenities' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F1F0EC]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-black text-[#171717]">Venue Amenities</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2FA66A]/10 text-[#2FA66A] border border-[#2FA66A]/20">
                      Admin Standardized
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#777570]">
                    Admin-defined amenities available for your facility. Toggle on/off to reflect on player booking app ({activeAmenitiesCount} Active)
                  </p>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All Amenities' },
                  { id: 'Lighting', label: 'Lighting' },
                  { id: 'Facility', label: 'Facilities' },
                  { id: 'Refreshment', label: 'Refreshments' },
                  { id: 'Safety', label: 'Safety' },
                  { id: 'Equipment', label: 'Equipment' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setAmenityFilter(cat.id)}
                    className={`h-7.5 px-3 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                      amenityFilter === cat.id
                        ? 'bg-[#171717] text-white border-[#171717]'
                        : 'bg-[#FAF9F6] text-[#777570] border-[#E8E6E1] hover:text-[#171717]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Amenities Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 pt-1">
                {amenities
                  .filter((a) => amenityFilter === 'all' || a.category.toLowerCase() === amenityFilter.toLowerCase())
                  .map((amenity) => (
                    <div
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        amenity.enabled
                          ? 'bg-[#FAF9F6] border-[#171717]/20 shadow-xs'
                          : 'bg-white border-[#E8E6E1] opacity-65'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-[#E8E6E1] flex items-center justify-center shrink-0">
                          {getAmenityIcon(amenity.icon)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-[13px] font-bold text-[#171717]">{amenity.name}</h4>
                            <span className="text-[9px] font-bold uppercase text-[#777570] bg-white border border-[#E8E6E1] px-1.5 py-0.2 rounded">
                              {amenity.category}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-[#777570] mt-0.5">{amenity.details}</p>
                        </div>
                      </div>

                      <div
                        className={`w-10 h-5.5 rounded-full p-0.5 transition-colors shrink-0 ${
                          amenity.enabled ? 'bg-[#2FA66A]' : 'bg-[#D1CFCA]'
                        }`}
                      >
                        <div
                          className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                            amenity.enabled ? 'translate-x-4.5' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 4: OPERATING HOURS (Full Day-by-Day Time Editing)                 */}
          {/* ===================================================================== */}
          {activeTab === 'operating_hours' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F1F0EC]">
                <div>
                  <h3 className="text-[17px] font-black text-[#171717]">Operating Schedule</h3>
                  <p className="text-[11.5px] text-[#777570]">
                    Configure daily facility opening & closing hours, slot availability and closed days
                  </p>
                </div>
                {isStaff ? (
                  <span className="text-[11px] font-bold text-[#777570] bg-[#FAF9F6] px-3 py-1.5 rounded-xl border border-[#E8E6E1] self-start sm:self-auto flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>View Only (Staff)</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      haptics.tap();
                      await refreshFromOnboarding();
                      showToast('Operating Hours Synced', 'Schedule synchronized with verified onboarding records.', 'success');
                    }}
                    className="text-[11px] font-bold text-[#FF6B2C] bg-[#FF6B2C]/10 hover:bg-[#FF6B2C]/20 px-3 py-1.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    ⚡ Sync Onboarding Schedule
                  </button>
                )}
              </div>

              {/* Day Rows with Time Pickers */}
              <div className="space-y-2.5">
                {operatingHours.map((day) => (
                  <div
                    key={day.day}
                    className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      day.isOpen
                        ? 'bg-[#FAF9F6] border-[#E8E6E1]'
                        : 'bg-white border-[#E8E6E1] opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E6E1] flex items-center justify-center font-black text-[13px] text-[#171717] shrink-0">
                        {day.day.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-[13.5px] font-black text-[#171717]">{day.day}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              day.isOpen
                                ? 'bg-[#2FA66A]/10 text-[#2FA66A]'
                                : 'bg-[#EF4444]/10 text-[#EF4444]'
                            }`}
                          >
                            {day.isOpen ? 'Open for Bookings' : 'Facility Closed'}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-[#777570] mt-0.5">
                          {day.isOpen ? 'Active booking slots generated' : 'All court slots locked'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8E6E1]/60">
                      {day.isOpen ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            disabled={isStaff}
                            value={day.openTime}
                            onChange={(e) => updateOperatingDayHours(day.day, e.target.value, day.closeTime)}
                            className="bg-white disabled:bg-[#F1F0EC] disabled:text-[#777570] disabled:cursor-not-allowed border border-[#E8E6E1] rounded-xl px-2.5 py-1.5 text-[11.5px] font-bold text-[#171717] focus:outline-none cursor-pointer"
                          >
                            {Array.from(new Set([day.openTime, ...SETTINGS_TIME_OPTIONS])).map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <span className="text-[11px] font-bold text-[#777570]">to</span>
                          <select
                            disabled={isStaff}
                            value={day.closeTime}
                            onChange={(e) => updateOperatingDayHours(day.day, day.openTime, e.target.value)}
                            className="bg-white disabled:bg-[#F1F0EC] disabled:text-[#777570] disabled:cursor-not-allowed border border-[#E8E6E1] rounded-xl px-2.5 py-1.5 text-[11.5px] font-bold text-[#171717] focus:outline-none cursor-pointer"
                          >
                            {Array.from(new Set([day.closeTime, ...SETTINGS_TIME_OPTIONS])).map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="text-[12px] font-bold text-[#A3A099]">Closed All Day</span>
                      )}

                      <button
                        type="button"
                        disabled={isStaff}
                        onClick={() => {
                          if (isStaff) {
                            showToast('View Only Mode', 'Only the venue owner can toggle operating days.', 'info');
                            return;
                          }
                          haptics.tap();
                          toggleOperatingDay(day.day);
                        }}
                        className={`w-10 h-5.5 rounded-full p-0.5 transition-colors shrink-0 ${
                          isStaff ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                        } ${day.isOpen ? 'bg-[#171717]' : 'bg-[#D1CFCA]'}`}
                      >
                        <div
                          className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                            day.isOpen ? 'translate-x-4.5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 5: BOOKING SETTINGS                                               */}
          {/* ===================================================================== */}
          {activeTab === 'booking_settings' && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-[#F1F0EC]">
                <h3 className="text-[17px] font-black text-[#171717]">Booking Policy & Rules</h3>
                <p className="text-[11.5px] text-[#777570]">
                  Advance reservation windows, player hold timers & minimum booking notice limits
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] font-bold text-[#171717]">Advance Booking Window</span>
                    <span className="text-[12px] font-black text-[#FF6B2C]">
                      {bookingSettings.advanceBookingDays} Days
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[7, 14, 30, 60].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => updateBookingSettings({ advanceBookingDays: days })}
                        className={`py-1.5 rounded-lg text-[11.5px] font-bold border cursor-pointer ${
                          bookingSettings.advanceBookingDays === days
                            ? 'bg-[#171717] text-white border-[#171717]'
                            : 'bg-white text-[#777570] border-[#E8E6E1]'
                        }`}
                      >
                        {days}d
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] font-bold text-[#171717]">Online Hold Expiry Timer</span>
                    <span className="text-[12px] font-black text-[#2FA66A]">
                      {cancellationPolicy.autoReleaseHoldMinutes || 15} Mins
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[5, 10, 15].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => updateCancellationPolicy({ autoReleaseHoldMinutes: mins })}
                        className={`py-1.5 rounded-lg text-[11.5px] font-bold border cursor-pointer ${
                          cancellationPolicy.autoReleaseHoldMinutes === mins
                            ? 'bg-[#171717] text-white border-[#171717]'
                            : 'bg-white text-[#777570] border-[#E8E6E1]'
                        }`}
                      >
                        {mins} Mins
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] flex items-center justify-between">
                <div>
                  <h4 className="text-[13px] font-bold text-[#171717]">Allow Multi-Court Consecutive Bookings</h4>
                  <p className="text-[11px] text-[#777570]">Permit single customers to reserve adjacent slots across grounds</p>
                </div>
                <div className="w-9 h-5 rounded-full p-0.5 bg-[#2FA66A]">
                  <div className="w-4 h-4 rounded-full bg-white translate-x-4" />
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 6: NOTIFICATION SETTINGS (DIRECT ON/OFF SWITCHES)                 */}
          {/* ===================================================================== */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-[#F1F0EC]">
                <h3 className="text-[17px] font-black text-[#171717]">Notification Settings (On / Off Toggles)</h3>
                <p className="text-[11.5px] text-[#777570]">
                  Directly toggle automated alert dispatch channels and venue operator notifications
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    key: 'whatsappBookingAlerts' as const,
                    title: 'WhatsApp Booking Confirmation',
                    caption: 'Send instant match passes and QR receipts to players upon booking',
                    enabled: notificationPreferences.whatsappBookingAlerts,
                  },
                  {
                    key: 'slotHoldExpiryAlerts' as const,
                    title: 'Slot Hold Expiry Warning',
                    caption: 'Alert operator when a 15-minute held checkout timer is about to lapse',
                    enabled: notificationPreferences.slotHoldExpiryAlerts,
                  },
                  {
                    key: 'dailyPayoutDigest' as const,
                    title: 'Daily Midnight Payout Digest',
                    caption: 'Automated midnight summary of IMPS settlements credited to linked bank',
                    enabled: notificationPreferences.dailyPayoutDigest,
                  },
                  {
                    key: 'slotMaintenanceReminders' as const,
                    title: 'Maintenance Block Reminders',
                    caption: 'Push notification 30 mins before scheduled court maintenance blocks',
                    enabled: notificationPreferences.slotMaintenanceReminders,
                  },
                ].map((notif) => (
                  <div
                    key={notif.key}
                    className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-[13px] font-bold text-[#171717]">{notif.title}</h4>
                      <p className="text-[11px] text-[#777570]">{notif.caption}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        updateNotificationPreferences({
                          [notif.key]: !notif.enabled,
                        });
                        showToast(
                          'Setting Updated',
                          `${notif.title} is now ${!notif.enabled ? 'ON' : 'OFF'}.`,
                          'info'
                        );
                      }}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                        notif.enabled ? 'bg-[#2FA66A]' : 'bg-[#D1CFCA]'
                      }`}
                    >
                      <div
                        className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                          notif.enabled ? 'translate-x-4.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 7: PRIVACY POLICY (RICH TEXT DOCUMENT)                            */}
          {/* ===================================================================== */}
          {activeTab === 'privacy' && (
            <div className="space-y-5 text-[#262524] text-[13px] leading-relaxed">
              <div className="border-b border-[#F1F0EC] pb-3">
                <span className="text-[10.5px] font-bold text-[#2FA66A] bg-[#2FA66A]/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-1">
                  <Shield className="w-3 h-3" />
                  <span>Official Privacy Policy · Version 2.4</span>
                </span>
                <h3 className="text-[20px] font-black text-[#171717] tracking-tight">
                  Venue & Player Data Protection Policy
                </h3>
                <p className="text-[11.5px] text-[#777570]">
                  Effective: 1 August 2026 · Governing operations for {venueName}
                </p>
              </div>

              <div className="bg-[#FAF9F6] border-l-3 border-[#FF6B2C] p-3.5 rounded-r-xl text-[12.5px] text-[#403E3B]">
                TurfTown ensures bank-grade 256-bit encryption for all booking transactions, customer phone numbers, and IMPS bank settlements. Data is never sold or utilized for third-party ad targeting.
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[15px] font-black text-[#171717]">1. Data Collection & Processing</h4>
                <p className="text-[#55534E]">
                  We gather necessary venue records, staff credentials, player names, and phone numbers exclusively to facilitate ground bookings, prevent double-scheduling, and automate dynamic UPI QR payments.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[15px] font-black text-[#171717]">2. Financial Reconciliations & Security</h4>
                <p className="text-[#55534E]">
                  Payment metadata, UPI reference strings, and settlement audit trails are processed under RBI-compliant gateway standards with automatic midnight T+0 IMPS direct payout.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[15px] font-black text-[#171717]">3. Data Retention & Operator Rights</h4>
                <p className="text-[#55534E]">
                  Venue owners retain full ownership of customer transaction records and may download comprehensive Excel, CSV, or PDF statements at any time via the Export Reports tool.
                </p>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 8: TERMS & CONDITIONS                                             */}
          {/* ===================================================================== */}
          {activeTab === 'terms' && (
            <div className="space-y-5 text-[#262524] text-[13px] leading-relaxed">
              <div className="border-b border-[#F1F0EC] pb-3">
                <span className="text-[10.5px] font-bold text-[#FF6B2C] bg-[#FF6B2C]/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-1">
                  <FileText className="w-3 h-3" />
                  <span>Platform Terms of Service · Version 2.4</span>
                </span>
                <h3 className="text-[20px] font-black text-[#171717] tracking-tight">
                  TurfTown Partner Terms & Conditions
                </h3>
                <p className="text-[11.5px] text-[#777570]">
                  Operating agreement between TurfTown and {venueName}
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[15px] font-black text-[#171717]">1. Booking Honor System</h4>
                <p className="text-[#55534E]">
                  All confirmed player reservations placed online or manually entered at the ground must be honored during reserved timeframes. Emergency court closures must be initiated with reasonable notice.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[15px] font-black text-[#171717]">2. Cancellation Rules</h4>
                <p className="text-[#55534E]">
                  Refunds and cancellations are governed strictly by the court-specific buffer hours and payout percentages configured in your Cancellation Settings panel.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: REQUEST BANK ACCOUNT CHANGE (Pending Admin Approval)              */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isBankChangeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <div className="absolute inset-0" onClick={() => setIsBankChangeModalOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-5 border border-[#E8E6E1] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F0EC]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-[#171717]">Request Bank Account Change</h3>
                    <p className="text-[11px] text-[#777570]">Subject to TurfTown Admin Verification</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBankChangeModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#F1F0EC] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleSubmitBankChange} className="space-y-3">
                <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] text-[11px] text-[#777570] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-[#FF6B2C] shrink-0" />
                  <span>Existing HDFC payouts will continue until this request is approved by admin.</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    New Bank Name <span className="text-[#FF6B2C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ICICI Bank, State Bank of India"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    Account Holder Name <span className="text-[#FF6B2C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Must match GSTIN / Business Name"
                    value={newHolderName}
                    onChange={(e) => setNewHolderName(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      Account Number <span className="text-[#FF6B2C]">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Account number"
                      value={newAccountNumber}
                      onChange={(e) => setNewAccountNumber(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      Confirm Account <span className="text-[#FF6B2C]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Re-enter number"
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      IFSC Code <span className="text-[#FF6B2C]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ICIC0001234"
                      value={newIfsc}
                      onChange={(e) => setNewIfsc(e.target.value.toUpperCase())}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">Account Type</label>
                    <select
                      value={newAccountType}
                      onChange={(e) => setNewAccountType(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-2.5 py-2 text-[12px] font-bold text-[#171717] focus:outline-none"
                    >
                      <option value="Current Commercial">Current Commercial</option>
                      <option value="Savings">Savings Account</option>
                    </select>
                  </div>
                </div>

                {/* Cancelled Cheque upload mock */}
                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    Proof of Account (Cancelled Cheque / Bank Passbook)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setHasChequeAttached(true);
                      showToast('Document Attached', 'Cancelled_Cheque_2026.pdf uploaded.', 'success');
                    }}
                    className={`w-full py-2.5 rounded-xl border-2 border-dashed flex items-center justify-center gap-1.5 text-[12px] font-bold transition-all cursor-pointer ${
                      hasChequeAttached
                        ? 'border-[#2FA66A] bg-[#2FA66A]/10 text-[#2FA66A]'
                        : 'border-[#E8E6E1] bg-[#FAF9F6] text-[#777570] hover:border-[#171717]'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{hasChequeAttached ? '✓ Cancelled_Cheque_2026.pdf Attached' : 'Attach Cancelled Cheque PDF/Image'}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">Reason for Change</label>
                  <input
                    type="text"
                    placeholder="e.g. Migrating to new business corporate branch"
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-medium text-[#171717] focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-10 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-black text-[13px] flex items-center justify-center gap-1.5 shadow-sm active-press cursor-pointer"
                  >
                    <span>Submit Request to Admin</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: ADD VENUE PHOTO (Max 8)                                            */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAddPhotoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <div className="absolute inset-0" onClick={() => setIsAddPhotoOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-5 border border-[#E8E6E1] shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F0EC]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-[#171717]">Add Venue Photo</h3>
                    <p className="text-[11px] text-[#777570]">{venuePhotos.length} of 8 uploaded</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddPhotoOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#F1F0EC] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    Photo Title / Area Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Floodlit Goalpost View 1"
                    value={newPhotoLabel}
                    onChange={(e) => setNewPhotoLabel(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] flex items-center justify-center flex-col gap-2 py-6">
                  <Upload className="w-6 h-6 text-[#FF6B2C]" />
                  <span className="text-[12px] font-bold text-[#171717]">Select high-res arena image</span>
                  <span className="text-[10px] text-[#777570]">JPG, PNG up to 10MB</span>
                </div>

                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="w-full h-10 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-black text-[13px] flex items-center justify-center gap-1.5 shadow-sm active-press cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Photo to Gallery</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="absolute inset-0" onClick={() => setPreviewDoc(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-3xl border border-[#E8E6E1] shadow-2xl overflow-hidden flex flex-col z-10 max-h-[85vh]">
            <div className="p-4 border-b border-[#E8E6E1] flex items-center justify-between bg-[#FAF9F6]">
              <div>
                <h3 className="text-[15px] font-black text-[#171717]">{previewDoc.title}</h3>
                <p className="text-[11px] font-mono text-[#777570]">{previewDoc.docId}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#E8E6E1] flex items-center justify-center text-[#777570] hover:text-[#171717] active-press cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-[#FAF9F6] min-h-[280px]">
              {previewDoc.type === 'image' || previewDoc.url.match(/\.(jpeg|jpg|png|webp)($|\?)/i) ? (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
                  className="max-h-[55vh] max-w-full rounded-xl object-contain shadow-sm border border-[#E8E6E1]"
                />
              ) : (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.title}
                  className="w-full h-[55vh] rounded-xl border border-[#E8E6E1] bg-white"
                />
              )}
            </div>

            <div className="p-3 border-t border-[#E8E6E1] bg-white flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#2FA66A] bg-[#2FA66A]/10 px-2.5 py-1 rounded-full border border-[#2FA66A]/20">
                ✓ Document Verified & Valid
              </span>
              <a
                href={previewDoc.url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-[#FF6B2C] hover:underline flex items-center gap-1"
              >
                <span>Full View</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

