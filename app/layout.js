import { Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const display = Bricolage_Grotesque({ subsets: ['latin'], axes: ['opsz', 'wdth'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });

export const metadata = {
  title: 'Parallax — private cross-chain swaps',
  description: 'Move value between chains without a public link between your wallets. Powered by NEAR Intents confidential swaps.',
  icons: { icon: '/icon.svg' },
  openGraph: {
    title: 'Parallax',
    description: 'Leave one chain. Arrive on another. No line between them.',
  },
};

export const viewport = {
  themeColor: '#0C0A18',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
