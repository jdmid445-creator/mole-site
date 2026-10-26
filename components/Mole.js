// The Parallax mascot: night palette, peeking out of its tunnel.
export default function Mole({ size = 360, eyes = '#C8FF2E', id = 'mole', title = 'The Parallax creature peeking out of its tunnel' }) {
  return (
    <svg role="img" aria-label={title} width={size} height={size} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${id}-body`} cx="38%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#9A86FF" />
          <stop offset="55%" stopColor="#5A41D6" />
          <stop offset="100%" stopColor="#2A1C7A" />
        </radialGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7B62F0" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#7B62F0" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-above`}>
          <rect x="0" y="0" width="400" height="300" />
        </clipPath>
      </defs>
      <circle cx="200" cy="230" r="185" fill={`url(#${id}-glow)`} />
      <ellipse cx="200" cy="300" rx="158" ry="36" fill="#030208" stroke="#3A2A8C" strokeWidth="2" strokeOpacity="0.3" />
      <g clipPath={`url(#${id}-above)`}>
        <g className="mole-body">
          <path d="M200 100 C286 100 330 166 330 250 C330 320 280 352 200 352 C120 352 70 320 70 250 C70 166 114 100 200 100 Z" fill={`url(#${id}-body)`} />
          <path d="M200 176 C248 176 278 208 278 244 C278 278 244 298 200 298 C156 298 122 278 122 244 C122 208 152 176 200 176 Z" fill="#07050F" />
          <g className="mole-eyes">
            <ellipse className="mole-eye" cx="174" cy="236" rx="10" ry="16" fill={eyes} />
            <ellipse className="mole-eye" cx="226" cy="236" rx="10" ry="16" fill={eyes} />
          </g>
          <ellipse cx="200" cy="274" rx="15" ry="10" fill="#FF8FB8" />
          <g className="mole-spirals" opacity="0" fill="none" stroke={eyes} strokeWidth="4" strokeLinecap="round">
            <g transform="translate(174 236)"><path className="mole-spiral" d="M0.5 0.0 L0.6 0.1 L0.7 0.2 L0.8 0.3 L0.8 0.4 L0.9 0.5 L0.9 0.7 L0.9 0.9 L0.9 1.0 L0.8 1.2 L0.7 1.4 L0.6 1.5 L0.4 1.7 L0.3 1.8 L0.1 2.0 L-0.2 2.1 L-0.4 2.1 L-0.7 2.2 L-0.9 2.2 L-1.2 2.2 L-1.5 2.1 L-1.8 2.0 L-2.1 1.9 L-2.4 1.7 L-2.6 1.4 L-2.9 1.2 L-3.1 0.9 L-3.3 0.6 L-3.4 0.2 L-3.5 -0.2 L-3.6 -0.6 L-3.6 -1.0 L-3.6 -1.4 L-3.5 -1.8 L-3.4 -2.3 L-3.2 -2.7 L-2.9 -3.1 L-2.6 -3.5 L-2.3 -3.8 L-1.9 -4.2 L-1.4 -4.4 L-1.0 -4.7 L-0.5 -4.9 L0.1 -5.0 L0.6 -5.1 L1.2 -5.1 L1.8 -5.0 L2.4 -4.9 L3.0 -4.7 L3.5 -4.4 L4.0 -4.0 L4.5 -3.6 L5.0 -3.2 L5.4 -2.7 L5.8 -2.1 L6.1 -1.5 L6.3 -0.8 L6.5 -0.1 L6.5 0.6 L6.5 1.4 L6.4 2.1 L6.3 2.8 L6.0 3.6 L5.7 4.3 L5.2 4.9 L4.7 5.5 L4.2 6.1 L3.5 6.6 L2.8 7.1 L2.0 7.4 L1.2 7.7 L0.4 7.9 L-0.5 8.0 L-1.4 8.0 L-2.3 7.9 L-3.2 7.7 L-4.1 7.4 L-4.9 7.0 L-5.7 6.5 L-6.5 5.9 L-7.2 5.2 L-7.8 4.4 L-8.3 3.6 L-8.8 2.7 L-9.1 1.7 L-9.4 0.7 L-9.5 -0.3 L-9.5 -1.4 L-9.4 -2.4 L-9.2 -3.5 L-8.8 -4.5 L-8.4 -5.5 L-7.8 -6.4 L-7.1 -7.3 L-6.3 -8.2 L-5.4 -8.9 L-4.5 -9.5 L-3.4 -10.1 L-2.3 -10.5 L-1.2 -10.8 L0.0 -10.9 L1.2 -11.0 L2.4 -10.9 L3.6 -10.7 L4.8 -10.3 L6.0 -9.8 L7.1 -9.1 L8.1 -8.4 L9.1 -7.5 L9.9 -6.5 L10.7 -5.4 L11.3 -4.3 L11.8 -3.0 L12.2 -1.7 L12.4 -0.4 L12.5 1.0 L12.4 2.4 L12.2 3.7 L11.8 5.1 L11.2 6.4 L10.5 7.7" /></g>
            <g transform="translate(226 236)"><path className="mole-spiral" d="M0.5 0.0 L0.6 0.1 L0.7 0.2 L0.8 0.3 L0.8 0.4 L0.9 0.5 L0.9 0.7 L0.9 0.9 L0.9 1.0 L0.8 1.2 L0.7 1.4 L0.6 1.5 L0.4 1.7 L0.3 1.8 L0.1 2.0 L-0.2 2.1 L-0.4 2.1 L-0.7 2.2 L-0.9 2.2 L-1.2 2.2 L-1.5 2.1 L-1.8 2.0 L-2.1 1.9 L-2.4 1.7 L-2.6 1.4 L-2.9 1.2 L-3.1 0.9 L-3.3 0.6 L-3.4 0.2 L-3.5 -0.2 L-3.6 -0.6 L-3.6 -1.0 L-3.6 -1.4 L-3.5 -1.8 L-3.4 -2.3 L-3.2 -2.7 L-2.9 -3.1 L-2.6 -3.5 L-2.3 -3.8 L-1.9 -4.2 L-1.4 -4.4 L-1.0 -4.7 L-0.5 -4.9 L0.1 -5.0 L0.6 -5.1 L1.2 -5.1 L1.8 -5.0 L2.4 -4.9 L3.0 -4.7 L3.5 -4.4 L4.0 -4.0 L4.5 -3.6 L5.0 -3.2 L5.4 -2.7 L5.8 -2.1 L6.1 -1.5 L6.3 -0.8 L6.5 -0.1 L6.5 0.6 L6.5 1.4 L6.4 2.1 L6.3 2.8 L6.0 3.6 L5.7 4.3 L5.2 4.9 L4.7 5.5 L4.2 6.1 L3.5 6.6 L2.8 7.1 L2.0 7.4 L1.2 7.7 L0.4 7.9 L-0.5 8.0 L-1.4 8.0 L-2.3 7.9 L-3.2 7.7 L-4.1 7.4 L-4.9 7.0 L-5.7 6.5 L-6.5 5.9 L-7.2 5.2 L-7.8 4.4 L-8.3 3.6 L-8.8 2.7 L-9.1 1.7 L-9.4 0.7 L-9.5 -0.3 L-9.5 -1.4 L-9.4 -2.4 L-9.2 -3.5 L-8.8 -4.5 L-8.4 -5.5 L-7.8 -6.4 L-7.1 -7.3 L-6.3 -8.2 L-5.4 -8.9 L-4.5 -9.5 L-3.4 -10.1 L-2.3 -10.5 L-1.2 -10.8 L0.0 -10.9 L1.2 -11.0 L2.4 -10.9 L3.6 -10.7 L4.8 -10.3 L6.0 -9.8 L7.1 -9.1 L8.1 -8.4 L9.1 -7.5 L9.9 -6.5 L10.7 -5.4 L11.3 -4.3 L11.8 -3.0 L12.2 -1.7 L12.4 -0.4 L12.5 1.0 L12.4 2.4 L12.2 3.7 L11.8 5.1 L11.2 6.4 L10.5 7.7" /></g>
          </g>
          <ellipse className="mole-cheek" cx="152" cy="264" rx="9" ry="4.5" fill="#FF8FB8" opacity="0" />
          <ellipse className="mole-cheek" cx="248" cy="264" rx="9" ry="4.5" fill="#FF8FB8" opacity="0" />
        </g>
      </g>
      <g className="mole-paws">
        <ellipse cx="118" cy="300" rx="34" ry="18" fill="#6B52E4" />
        <ellipse cx="282" cy="300" rx="34" ry="18" fill="#6B52E4" />
      </g>
    </svg>
  );
}
