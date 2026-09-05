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
    <div className="pb-28 pt-2 px-4 w-full max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-[#E8E6E1]/70">
        <button
          onClick={goBack}
          className="md:hidden w-10 h-10 rounded-2xl bg-white border border-[#E8E6E1] flex items-center justify-center text-[#171717] hover:bg-[#F7F7F5] shadow-2xs active-press cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
        </button>
        <div>
          <h1 className="text-[24px] font-black text-[#171717] tracking-tight">Raise a Support Ticket</h1>
          <p className="text-[12.5px] font-medium text-[#777570]">
            Our merchant operations desk responds within 30 minutes for payment and slot assistance.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Pill Selection */}
        <div>
          <label className="block text-[13px] font-bold text-[#171717] mb-2">
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
                    ? 'bg-[#171717] text-white shadow-xs'
                    : 'bg-white text-[#777570] border border-[#E8E6E1]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Line */}
        <div>
          <label className="block text-[13px] font-bold text-[#171717] mb-1.5">
            Subject
          </label>
          <div className="bg-[#F7F7F5] border border-[#E8E6E1] rounded-[14px] px-3.5 py-3 focus-within:border-[#171717] focus-within:bg-white transition-all">
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. UPI balance settlement query for Turf 1"
              className="w-full text-[14px] font-semibold text-[#171717] bg-transparent focus:outline-none placeholder-[#A3A099]"
            />
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-[13px] font-bold text-[#171717] mb-1.5">
            Description
          </label>
          <div className="bg-[#F7F7F5] border border-[#E8E6E1] rounded-[14px] p-3.5 focus-within:border-[#171717] focus-within:bg-white transition-all">
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact booking ID, transaction timestamp, or court details to help us investigate immediately..."
              className="w-full text-[14px] font-medium text-[#171717] bg-transparent focus:outline-none placeholder-[#A3A099] resize-none"
            />
          </div>
        </div>

        {/* Attachment Box (Drag & drop / click upload) */}
        <div>
          <label className="block text-[13px] font-bold text-[#171717] mb-1.5">
            Attach Screenshot / Receipt (Optional)
          </label>
          <div
            onClick={() => setHasAttachment(!hasAttachment)}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
              hasAttachment
                ? 'border-[#2FA66A] bg-[#2FA66A]/5'
                : 'border-[#E8E6E1] bg-[#F7F7F5] hover:border-[#171717]'
            }`}
          >
            {hasAttachment ? (
              <div className="flex items-center justify-center gap-2 text-[#2FA66A]">
                <Check className="w-5 h-5" />
                <span className="text-[13px] font-bold">Screenshot attached (upi_payment_ref.png)</span>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="w-5 h-5 text-[#777570] mx-auto" />
                <p className="text-[13px] font-bold text-[#171717]">
                  Tap to upload screenshot or slip
                </p>
                <p className="text-[11px] text-[#777570]">PNG, JPG, PDF up to 10MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            className="w-full h-13 rounded-2xl bg-[#FF6B2C] text-white font-bold text-[15px] flex items-center justify-center shadow-md hover:bg-[#e85b1e] active-press transition-all cursor-pointer"
          >
            Submit Support Request
          </button>
        </div>
      </form>
    </div>
  );
};
