# iBookSports — Vendor Web Portal (`manager_repo`)

Welcome to the **iBookSports Partner Management Portal** (`manager_repo`).  
This web application is the primary desktop & tablet operating dashboard for venue owners, turf directors, and managers to manage sports facilities, court configurations, pricing tiers, operating hours, customer bookings, T+2 financial payouts, and platform support.

---

## 1. Developer & Repository Information

* **Owner / Lead:** **Sethu** (Vendor Web Portal Lead)
* **Application Path:** `d:\Ibooksports\manager_repo`
* **Technology Stack:** React 19, Vite, TypeScript, Tailwind CSS, Lucide Icons
* **Complete API Specification Document:** [`SETHU_VENDOR_WEB_API_SPECIFICATION.md`](../SETHU_VENDOR_WEB_API_SPECIFICATION.md)

---

## 2. Getting Started & Local Setup

### Step 1: Install Dependencies
```bash
cd manager_repo
npm install
```

### Step 2: Configure Environment Variables
Create or edit `.env` in the root of `manager_repo`:
```env
# Point to the live deployed Render backend (or local dev server)
VITE_API_BASE_URL=https://<YOUR-RENDER-BACKEND-NAME>.onrender.com/api/v1

# Local fallback (if running backend on machine)
# VITE_API_BASE_URL=http://localhost:4000/api/v1

# Payment Gateway Public Key (for Razorpay checkout test mode)
VITE_RAZORPAY_KEY_ID=rzp_test_51NhD...
```

### Step 3: Run the Development Server
```bash
npm run dev
```
The portal will launch at `http://localhost:5173`.

---

## 3. Screen-to-API Integration Directory

All existing screens in `frontend/src/screens/` map directly to the backend APIs:

| Screen File | User Action / Feature | API Endpoint & Method | Purpose |
| :--- | :--- | :--- | :--- |
| `LoginScreen.tsx` | Enter 10-digit mobile | `POST /onboarding/send-otp` | Request 6-digit SMS OTP |
| `OtpScreen.tsx` | Enter 6-digit OTP code | `POST /onboarding/verify-otp` | Verify OTP & receive Bearer Token |
| `HomeScreen.tsx` | Overview dashboard & KPIs | `GET /onboarding/vendor/profile` | Load venue profile, owner KYC, gross revenue |
| `VenueProfileScreen.tsx` | Update venue info & Maps URL | `PUT /onboarding/vendor/profile` | Update address, contact, and Google Maps URL |
| `CourtsScreen.tsx` | List & configure courts | `POST /onboarding/step/courts` | Save court rates, peak hours & weekend prices |
| `AddCourtScreen.tsx` | Request new physical court | `POST /court-requests` | Submit new court proposal to Super Admin |
| `OperatingHoursScreen.tsx` | Set weekly schedule (Mon–Sun) | `POST /onboarding/step/operating-hours` | Configure venue open & close times |
| `BookingListScreen.tsx` | View all reservations & slots | `GET /bookings?venue_id=:id&date=:date` | Filter bookings by date, court, and status |
| `NewBookingModal.tsx` | Book walk-in customer slot | `POST /bookings` | Lock slot for customer (Online Advance or Cash) |
| `CancellationRefundScreen.tsx`| Cancel booking & issue refund | `PATCH /bookings/:id/cancel` | Cancel booking with policy-based refund |
| `PaymentsScreen.tsx` | View T+2 settlement payouts | `GET /settlements?venue_id=:id` | Track bank transfers, deductions, & UTR numbers |
| `SupportScreen.tsx` | Raise issue to Super Admin | `POST /support` | Submit ticket for double-debits, rain, or errors |

---

## 4. Core Business Logic Rules to Remember

1. **1 Physical Court = 1 Dedicated Sport**:
   * Each physical court record must have `sports: ["FOOTBALL"]` or `sports: ["CRICKET"]`.
   * If a court is multi-sport shared, you must explicitly set `use_one_physical_court_for_two_sports: false` unless verified with Super Admin.
2. **50% Online Advance vs 50% Counter Cash**:
   * Customer pays 50% online via Razorpay to hold the slot.
   * Customer pays the remaining 50% in cash at your counter when arriving for the match.
3. **T+2 Rolling Settlement Formula**:
   * Matches played on Day T are calculated for bank payout on Day T+2.
   * `Net Bank Transfer = Online Advance Held - 10% Platform Fee - 18% GST on Fee - 1% TDS`.
4. **Slot Collision Prevention**:
   * If a slot is already taken, the API returns `409 Conflict` with `SLOT_ALREADY_BOOKED`.
   * If a slot is in active customer checkout, the API returns `409 Conflict` with `SLOT_HELD` and remaining countdown time.

---

## 5. Standard API Response Formats

### Positive Response (`200 OK` / `201 Created`):
```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Negative Response (`400`, `401`, `403`, `404`, `409`):
```json
{
  "success": false,
  "statusCode": 409,
  "error": "SLOT_ALREADY_BOOKED",
  "message": "Slot 07:00 PM - 08:00 PM on Turf 1 is already reserved by another customer."
}
```

> **For complete JSON examples for every single API endpoint, open [`SETHU_VENDOR_WEB_API_SPECIFICATION.md`](../SETHU_VENDOR_WEB_API_SPECIFICATION.md).**
