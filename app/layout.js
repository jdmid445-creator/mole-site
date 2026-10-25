import { Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MotionObserver from '@/components/MotionObserver';

const display = Bricolage_Grotesque({ subsets: ['latin'], axes: ['opsz', 'wdth'], variable: '--font-display', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-code', display: 'swap' });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Parallax — private cross-chain swaps',
  description: 'Move value between chains without a public link between your wallets. Powered by NEAR Intents confidential swaps.',
  icons: { icon: '/icon.svg' },
  openGraph: {
    title: 'Parallax',
    description: 'Seen from one chain, it left. Seen from the other, it arrived. Private cross-chain swaps.',
    siteName: 'Parallax',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Parallax',
    description: 'Private cross-chain swaps. No line between your wallets.',
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
