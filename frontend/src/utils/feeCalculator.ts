/**
 * Financial Calculation Engine for Sports Turf Bookings
 * 
 * Flow & Rules:
 * 1. Court Fee (Turf Total Price):
 *    - Base Court Cost: Turf Total / 1.18
 *    - Venue GST: 18% on Base Court Cost
 *    - Total Turf Price: 100% credited to the Venue Owner.
 * 
 * 2. Platform Convenience Fee:
 *    - Convenience Fee Rate: 5% of Turf Total Price
 *    - Convenience GST: 18% on the 5% Convenience Fee
 *    - Total Platform Fee = (5% Turf Total) + (18% GST on Convenience Fee)
 * 
 * 3. Customer Total Payable:
 *    - Online Payment Link / QR / Cash = Court Fee + Platform Fee (incl. 18% GST)
 * 
 * 4. Settlement Rule for Cash:
 *    - If collected in physical Cash by venue owner, the Total Platform Fee (5% Conv + 18% Conv GST)
 *      is automatically deducted from the venue owner's next bank settlement payout.
 */

export interface BookingFinancials {
  courtTotal: number;
  baseCourtCost: number;
  courtGst18: number;
  convenienceFee5Percent: number;
  convenienceGst18Percent: number;
  totalConvenienceWithGst: number;
  totalCustomerPayable: number;
  ownerReceivesGross: number;
  advance50Percent: number;
  advanceCustomerPayable: number;
  remainingDueAtVenue: number;
  cashPayoutDeduction: number;
}

export function calculateBookingFinancials(courtAmount: number = 0): BookingFinancials {
  const courtTotal = Math.max(0, Math.round(courtAmount));
  
  // Venue Court breakdown (18% GST included in court total)
  const baseCourtCost = Math.round(courtTotal / 1.18);
  const courtGst18 = courtTotal - baseCourtCost;

  // Platform Convenience Fee: 5% of Turf Total Price
  const convenienceFee5Percent = Math.round(courtTotal * 0.05);

  // Convenience GST: 18% on Convenience Fee
  const convenienceGst18Percent = Math.round(convenienceFee5Percent * 0.18);

  // Total Platform Convenience Fee + GST
  const totalConvenienceWithGst = convenienceFee5Percent + convenienceGst18Percent;

  // Total amount payable by customer
  const totalCustomerPayable = courtTotal + totalConvenienceWithGst;

  // Advance calculation (50% turf deposit + full convenience fee + GST on first link payment)
  const advance50Percent = Math.round(courtTotal * 0.5);
  const advanceCustomerPayable = advance50Percent + totalConvenienceWithGst;
  const remainingDueAtVenue = courtTotal - advance50Percent;

  return {
    courtTotal,
    baseCourtCost,
    courtGst18,
    convenienceFee5Percent,
    convenienceGst18Percent,
    totalConvenienceWithGst,
    totalCustomerPayable,
    ownerReceivesGross: courtTotal,
    advance50Percent,
    advanceCustomerPayable,
    remainingDueAtVenue,
    cashPayoutDeduction: totalConvenienceWithGst,
  };
}
