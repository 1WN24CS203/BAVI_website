import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'BAVI — Bahubali Builders & Visionary Interiors',
  description: 'Premium construction and interior design management platform. Transform your architectural vision with luxury craftsmanship, transparent milestones, and bespoke interiors.',
  keywords: 'construction, interior design, luxury homes, builders, visionary interiors, BAVI',
  openGraph: {
    title: 'BAVI — Bahubali Builders & Visionary Interiors',
    description: 'Premium construction and interior design platform.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
