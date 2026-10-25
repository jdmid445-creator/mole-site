import { Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MotionObserver from '@/components/MotionObserver';

const display = Manrope({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-code', display: 'swap' });

// Live site address, used for link previews. www is the main address (the bare domain redirects to it).
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_ENV === 'production'
    ? 'https://www.parallaxswap.com'
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000');

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Parallax — private cross-chain swaps',
  description: 'Move value between chains without a public link between your wallets. Powered by NEAR Intents confidential swaps.',
  icons: {
    icon: [{ url: '/favicon.ico', sizes: '48x48' }, { url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: { title: 'Parallax', statusBarStyle: 'black-translucent' },
  openGraph: {
    title: 'Parallax — Private cross-chain swaps',
    description: 'Swap across 13 chains with no public link between your wallets. Non-custodial. Zero app fee.',
    siteName: 'Parallax',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@parallaxswap',
    creator: '@parallaxswap',
    title: 'Parallax — Private cross-chain swaps',
    description: 'Swap across 13 chains with no public link between your wallets. Non-custodial. Zero app fee.',
  },
};

export const viewport = {
  themeColor: '#0C0A18',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Set before first paint so scroll-reveal content never flashes in and out. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver' in window)document.documentElement.classList.add('motion')}catch(e){}",
          }}
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <MotionObserver />
      </body>
    </html>
  );
}
