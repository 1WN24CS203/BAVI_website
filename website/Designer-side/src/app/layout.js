import './globals.css';
import { DesignerAuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'BAVI Designer & Architect Command Portal',
  description: 'Enterprise project management and client milestone dashboard for Bahubali Builders & Visionary Interiors architects.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <DesignerAuthProvider>
          {children}
        </DesignerAuthProvider>
      </body>
    </html>
  );
}
