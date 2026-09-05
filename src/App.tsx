import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/ToastContainer';
import { BottomNav } from './components/BottomNav';
import { MobileDeviceFrame } from './components/MobileDeviceFrame';

// Screen Imports
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { OtpScreen } from './screens/OtpScreen';
import { HomeScreen } from './screens/HomeScreen';
import { BookingListScreen } from './screens/BookingListScreen';
import { BookingDetailsScreen } from './screens/BookingDetailsScreen';
import { SlotsScreen } from './screens/SlotsScreen';
import { PaymentsScreen } from './screens/PaymentsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { CourtsScreen } from './screens/CourtsScreen';
import { OperatingHoursScreen } from './screens/OperatingHoursScreen';
import { BookingSettingsScreen } from './screens/BookingSettingsScreen';
import { PaymentSettingsScreen } from './screens/PaymentSettingsScreen';
import { AmenitiesScreen } from './screens/AmenitiesScreen';
import { CancellationRefundScreen } from './screens/CancellationRefundScreen';
import { StaffManagementScreen } from './screens/StaffManagementScreen';
import { NotificationSettingsScreen } from './screens/NotificationSettingsScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { HelpSupportScreen } from './screens/HelpSupportScreen';
import { SupportFormScreen } from './screens/SupportFormScreen';
import { ExportReportScreen } from './screens/ExportReportScreen';
import { AddCourtScreen } from './screens/AddCourtScreen';
import { PrivacyPolicyScreen } from './screens/PrivacyPolicyScreen';
import { TermsConditionsScreen } from './screens/TermsConditionsScreen';

// Modal & Sheet Imports
import { PaymentCollectionSheet } from './screens/PaymentCollectionSheet';
import { QRPaymentSheet } from './screens/QRPaymentSheet';
import { RecordCashModal } from './screens/RecordCashModal';
import { SlotDetailsSheet } from './screens/SlotDetailsSheet';
import { BlockSlotSheet } from './screens/BlockSlotSheet';
import { NewBookingModal } from './screens/NewBookingModal';
import { ScreenType } from './types';

const MainAppContent: React.FC = () => {
  const { currentScreen } = useApp();

  const authScreens: ScreenType[] = ['splash', 'login', 'otp'];

  const isTabScreen = !authScreens.includes(currentScreen);

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'login':
        return <LoginScreen />;
      case 'otp':
        return <OtpScreen />;
      case 'home':
        return <HomeScreen />;
      case 'bookings':
        return <BookingListScreen />;
      case 'booking_details':
        return <BookingDetailsScreen />;
      case 'slots':
        return <SlotsScreen />;
      case 'payments':
        return <PaymentsScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'courts':
        return <CourtsScreen />;
      case 'operating_hours':
        return <OperatingHoursScreen />;
      case 'booking_settings':
        return <BookingSettingsScreen />;
      case 'payment_settings':
        return <PaymentSettingsScreen />;
      case 'amenities':
        return <AmenitiesScreen />;
      case 'cancellation_settings':
        return <CancellationRefundScreen />;
      case 'staff_management':
        return <StaffManagementScreen />;
      case 'notification_settings':
        return <NotificationSettingsScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'help_support':
        return <HelpSupportScreen />;
      case 'support_form':
        return <SupportFormScreen />;
      case 'export_report':
        return <ExportReportScreen />;
      case 'add_court':
        return <AddCourtScreen />;
      case 'privacy_policy':
        return <PrivacyPolicyScreen />;
      case 'terms_conditions':
        return <TermsConditionsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <>
      <MobileDeviceFrame
        deviceType="iphone"
        bottomNav={isTabScreen ? <BottomNav /> : undefined}
        overlay={
          <>
            {/* In-Frame Modals & Bottom Sheets (strictly matching mobile viewport) */}
            <PaymentCollectionSheet />
            <QRPaymentSheet />
            <RecordCashModal />
            <SlotDetailsSheet />
            <BlockSlotSheet />
            <NewBookingModal />

            {/* In-App Toast Container */}
            <ToastContainer />
          </>
        }
      >
        <div className="w-full min-h-full flex flex-col justify-between">
          {renderCurrentScreen()}
        </div>
      </MobileDeviceFrame>
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
