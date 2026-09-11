import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, Upload, Paperclip, Check, FileText } from 'lucide-react';
import { SupportCategory } from '../types';

export const SupportFormScreen: React.FC = () => {
  const { addSupportTicket, goBack } = useApp();

  const [category, setCategory] = useState<SupportCategory>('Payment');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [hasAttachment, setHasAttachment] = useState(false);

  const categories: SupportCategory[] = [
    'Booking',
    'Payment',
    'Court',
    'Technical',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    addSupportTicket({
      category,
      subject,
      description,
    });
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={goBack}
          className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-[#021526] hover:bg-[#E5E7EB]/50 active-press"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>
        <h1 className="text-[22px] font-bold text-[#021526]">Raise a Support Request</h1>
      </div>

      <p className="text-[13px] text-[#5F6368] -mt-2">
        Our TurfTown merchant operations team will respond within 30 minutes.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Pill Selection */}
        <div>
          <label className="block text-[13px] font-bold text-[#021526] mb-2">
            Select Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`h-9 px-3.5 rounded-full text-[13px] font-bold transition-all active-press ${
                  category === cat
                    ? 'bg-[#021526] text-white shadow-xs'
                    : 'bg-white text-[#5F6368] border border-[#E5E7EB]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Line */}
        <div>
          <label className="block text-[13px] font-bold text-[#021526] mb-1.5">
            Subject
          </label>
          <div className="bg-[#F3F4F4] border border-[#E5E7EB] rounded-[14px] px-3.5 py-3 focus-within:border-[#021526] focus-within:bg-white transition-all">
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. UPI balance settlement query for Turf 1"
              className="w-full text-[14px] font-semibold text-[#021526] bg-transparent focus:outline-none placeholder-[#5F6368]"
            />
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-[13px] font-bold text-[#021526] mb-1.5">
            Description
          </label>
          <div className="bg-[#F3F4F4] border border-[#E5E7EB] rounded-[14px] p-3.5 focus-within:border-[#021526] focus-within:bg-white transition-all">
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact booking ID, transaction timestamp, or court details to help us investigate immediately..."
              className="w-full text-[14px] font-medium text-[#021526] bg-transparent focus:outline-none placeholder-[#5F6368] resize-none"
            />
          </div>
        </div>

        {/* Attachment Box (Drag & drop / click upload) */}
        <div>
          <label className="block text-[13px] font-bold text-[#021526] mb-1.5">
            Attach Screenshot / Receipt (Optional)
          </label>
          <div
            onClick={() => setHasAttachment(!hasAttachment)}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
              hasAttachment
                ? 'border-[#16A34A] bg-[#16A34A]/5'
                : 'border-[#E5E7EB] bg-[#F3F4F4] hover:border-[#021526]'
            }`}
          >
            {hasAttachment ? (
              <div className="flex items-center justify-center gap-2 text-[#16A34A]">
                <Check className="w-5 h-5" />
                <span className="text-[13px] font-bold">Screenshot attached (upi_payment_ref.png)</span>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="w-5 h-5 text-[#5F6368] mx-auto" />
                <p className="text-[13px] font-bold text-[#021526]">
                  Tap to upload screenshot or slip
                </p>
                <p className="text-[11px] text-[#5F6368]">PNG, JPG, PDF up to 10MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            className="w-full h-13 rounded-2xl bg-[#F94001] text-white font-bold text-[15px] flex items-center justify-center shadow-md hover:bg-[#D93600] active-press transition-all cursor-pointer"
          >
            Submit Support Request
          </button>
        </div>
      </form>
    </div>
  );
};
