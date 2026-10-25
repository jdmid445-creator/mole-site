import { ImageResponse } from 'next/og';

// The share card shown when the site link is posted on X, Telegram, Discord, etc.
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = 'Parallax: private cross-chain swaps';

const MOLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><radialGradient id="b" cx="38%" cy="28%" r="78%"><stop offset="0%" stop-color="#9A86FF"/><stop offset="55%" stop-color="#5A41D6"/><stop offset="100%" stop-color="#2A1C7A"/></radialGradient><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#7B62F0" stop-opacity="0.5"/><stop offset="100%" stop-color="#7B62F0" stop-opacity="0"/></radialGradient><clipPath id="a"><rect width="400" height="300"/></clipPath></defs><circle cx="200" cy="230" r="185" fill="url(#g)"/><ellipse cx="200" cy="300" rx="158" ry="36" fill="#030208"/><g clip-path="url(#a)"><path d="M200 100C286 100 330 166 330 250C330 320 280 352 200 352C120 352 70 320 70 250C70 166 114 100 200 100Z" fill="url(#b)"/><path d="M200 176C248 176 278 208 278 244C278 278 244 298 200 298C156 298 122 278 122 244C122 208 152 176 200 176Z" fill="#07050F"/><ellipse cx="174" cy="236" rx="10" ry="16" fill="#C8FF2E"/><ellipse cx="226" cy="236" rx="10" ry="16" fill="#C8FF2E"/><ellipse cx="200" cy="274" rx="15" ry="10" fill="#FF8FB8"/></g><ellipse cx="118" cy="300" rx="34" ry="18" fill="#6B52E4"/><ellipse cx="282" cy="300" rx="34" ry="18" fill="#6B52E4"/></svg>`;

export function renderOgImage() {
  const mole = `data:image/svg+xml,${encodeURIComponent(MOLE_SVG)}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '64px 72px',
          backgroundColor: '#0c0a18',
          backgroundImage: 'radial-gradient(circle at 78% 45%, #2a1f66 0%, #0c0a18 58%)',
          color: '#f2f0eb',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 640 }}>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: '#cfc6ff', marginBottom: 28 }}>Parallax</div>
          <div style={{ display: 'flex', fontSize: 66, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>
            Seen from one chain, it left. Seen from the other, it arrived.
          </div>
          <div style={{ display: 'flex', fontSize: 28, color: '#aaa3cb', marginTop: 30 }}>
            Private cross-chain swaps. No line between your wallets.
          </div>
        </div>
        <img src={mole} width={420} height={420} alt="" />
      </div>
    ),
    { ...OG_SIZE }
  );
}
