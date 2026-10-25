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
        </g>
      </g>
      <g className="mole-paws">
        <ellipse cx="118" cy="300" rx="34" ry="18" fill="#6B52E4" />
        <ellipse cx="282" cy="300" rx="34" ry="18" fill="#6B52E4" />
      </g>
    </svg>
  );
}
