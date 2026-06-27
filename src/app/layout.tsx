import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/auth/AuthProvider';
import ConditionalLayout from '@/components/layout/ConditionalLayout';

export const metadata: Metadata = {
  title: {
    default: 'NICA STORE – Shop Smart, Live Better',
    template: '%s | NICA STORE',
  },
  description:
    "Kenya's premier online store. Electronics, fashion, home goods and more. Fast delivery, M-Pesa payments accepted.",
  keywords: ['online shopping', 'Kenya', 'M-Pesa', 'electronics', 'fashion', 'NICA STORE'],
  authors: [{ name: 'NICA STORE' }],
  themeColor: '#0B6B35',
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    siteName: 'NICA STORE',
    title: 'NICA STORE – Shop Smart, Live Better',
    description:
      "Kenya's premier online store. Electronics, fashion, home goods and more.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/*
          Inter with a wider weight range:
          - 300 for fine labels / captions
          - 400/500 for body
          - 700/800/900 for headings & display
        */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </AuthProvider>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0F1714',   /* --color-ink-900 */
              color: '#FAFAF8',        /* --color-surface */
              borderRadius: '0.625rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              padding: '0.75rem 1rem',
              boxShadow: '0 8px 24px rgba(15,23,20,0.18)',
              border: '1px solid rgba(255,255,255,0.06)',
            },
            success: {
              iconTheme: { primary: '#3aaa74', secondary: '#0F1714' },
            },
            error: {
              iconTheme: { primary: '#DC2626', secondary: '#0F1714' },
            },
          }}
        />
      </body>
    </html>
  );
}