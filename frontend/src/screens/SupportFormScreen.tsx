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
    'Payment',
    'Booking',
    'Technical',
    'Settlements',
    'General',
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
      <div className="flex items-center gap-3 pb-2 border-b border-[#E5E7EB]/70">
        <button
          onClick={goBack}
          className="md:hidden w-10 h-10 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#021526] hover:bg-[#F3F4F4] shadow-2xs active-press cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
        </button>
        <div>
          <h1 className="text-[24px] font-black text-[#021526] tracking-tight">Raise a Support Ticket</h1>
          <p className="text-[12.5px] font-medium text-[#5F6368]">
            Our merchant operations desk responds within 30 minutes for payment and slot assistance.
          </p>
        </div>
      </div>

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
                    ? 'bg-[#F94001] text-white shadow-sm shadow-[#F94001]/20'
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
