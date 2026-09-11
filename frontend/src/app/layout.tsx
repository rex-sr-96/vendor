import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TurfTown Owner',
  description: 'Premium mobile venue management control center for sports turf owners and operators.',
  openGraph: {
    title: 'TurfTown Owner',
    description: 'Premium mobile venue management control center for sports turf owners and operators.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F8F9FA] text-[#021526] antialiased selection:bg-[#F94001]/20 selection:text-[#F94001]">
        {children}
      </body>
    </html>
  );
}
