# Drop video soundtrack: downloaded music + downloaded SFX only (no synthesis). Drop lands on the phone; no ducking.
import json, sys, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR = 44100
c = json.load(open('sync_drop.json')); spb = 60 / c['bpm']; P = [(s, b * spb) for s, b in c['points']]; TOTAL = P[-1][1]
def T(story):
    for (s0, t0), (s1, t1) in zip(P, P[1:]):
        if s0 <= story <= s1 and s1 > s0: return t0 + (story - s0) / (s1 - s0) * (t1 - t0)
def load(path):
    sr, x = wavfile.read(path); x = x.astype(float) / 32768
    return x if x.ndim == 2 else np.stack([x, x], 1)
db = lambda d: 10 ** (d / 20)
D1, D2 = 'dl/', 'dl2/'
OLD = {k: D1 + 's_' + k + '.wav' for k in ['pop', 'glitch', 'swish', 'woosh', 'typing', 'click2', 'click1', 'riserhole', 'notif1', 'impact']}
NEW = {'spell': D2 + 'universfield-magic-spell-278824.wav', 'twinkle': D2 + 'shidenbeatsmusic-sound-effect-twinklesparkle-115095.wav',
       'swoosh': D2 + 'universfield-swoosh-010-352856.wav', 'riserT': D2 + 'dragon-studio-riser-swoosh-transition-390289.wav',
       'deep': D2 + 'dragon-studio-copyright-free-swoosh-487669.wav', 'tinkle': D2 + 'freesound_community-sfx-accent-eye-glitter-tinkle-1-6342.wav',
       'uipop': D2 + 'floraphonic-ui-pop-up-5-197889.wav', 'uipop2': D2 + 'floraphonic-ui-pop-up-14-197900.wav', 'softnote': D2 + 'universfield-soft-notification-146623.wav'}
S = {**OLD, **NEW}
SFX = [  # (story time, sfx, dB, align, excerpt)
    (1.98, 'pop', -13, 'peak'), (2.15, 'glitch', -14, 'onset', (0.22, 0.93)), (3.0, 'swish', -24, 'peak'),
    (4.3, 'woosh', -14, 'peak'), (5.05, 'pop', -19, 'peak'), (5.0, 'typing', -15, 'onset', (0.3, 1.0)), (6.45, 'click2', -12, 'onset'),
    (7.72, 'woosh', -19, 'peak'), (9.85, 'riserhole', -16, 'end', (1.6, 4.12)), (9.85, 'notif1', -15, 'onset'), (9.9, 'pop', -20, 'peak'),
    (11.05, 'woosh', -17, 'peak'), (11.65, 'pop', -20, 'peak'),
    # ghost wallets
    (13.35, 'riserT', -17, 'peak'), (14.0, 'pop', -19, 'peak'), (14.4, 'click2', -13, 'onset'), (14.6, 'typing', -16, 'onset', (0.3, 1.25)),
    (15.35, 'spell', -19, 'peak'),
    # split send
    (16.85, 'riserT', -17, 'peak'), (18.35, 'swoosh', -16, 'peak'), (18.47, 'swoosh', -18, 'peak'), (18.59, 'swoosh', -20, 'peak'),
    (19.25, 'tinkle', -14, 'onset'), (19.37, 'click1', -22, 'onset'), (19.49, 'click1', -23, 'onset'),
    # 13 chains
    (20.35, 'deep', -15, 'peak'), *[(20.5 + 0.055 * i, 'uipop', -24 - (i % 3), 'peak') for i in range(0, 13, 2)], (21.3, 'pop', -19, 'peak'), (21.6, 'uipop2', -17, 'peak'),
    # my crossings
    (23.85, 'riserT', -17, 'peak'), (24.5, 'pop', -19, 'peak'), (24.9, 'click1', -18, 'onset'), (26.0, 'softnote', -15, 'onset'),
    # end card
    (27.3, 'impact', -13, 'onset'), (27.3, 'woosh', -21, 'peak'), (27.45, 'pop', -18, 'peak'),
]
def mix(track, drop, out, start_override=None):
    m = load(track)
    lo = sosfilt(butter(4, 150, 'low', fs=SR, output='sos'), m.mean(1)); h = int(0.005 * SR)
    a = int((drop - 0.6) * SR); seg = lo[a:a + int(1.2 * SR)]; n = len(seg) // h
    e = np.sqrt((seg[:n * h].reshape(n, h) ** 2).mean(1)); d = np.diff(e); exact = drop if EXACT else drop - 0.6 + (int(np.argmax(d)) + 1) * 0.005
    start = (start_override if start_override is not None else exact - T(4.05)); i0 = int(start * SR); N = int(TOTAL * SR)
    mus = np.zeros((N, 2)); seg = m[max(0, i0):i0 + N]; mus[max(0, -i0):max(0, -i0) + len(seg)] = seg
    fi, fo = int(0.5 * SR), int(3.0 * SR)
    mus[:fi] *= np.linspace(0, 1, fi)[:, None] ** 2; mus[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.6
    mus *= db(-3) / np.abs(mus).max(); outm = mus.copy()
    cache = {}
    for st, k, g, al, *ex in SFX:
        s = cache.get(k) if not ex else None
        if s is None: s = load(S[k]); cache.setdefault(k, s)
        if ex: s = s[int(ex[0][0] * SR):int(ex[0][1] * SR)].copy(); r = int(0.02 * SR); s[:r] *= np.linspace(0, 1, r)[:, None]; s[-r:] *= np.linspace(1, 0, r)[:, None]
        s = s / np.abs(s).max() * db(g); env = np.abs(s).max(1)
        off = {'peak': int(env.argmax()), 'onset': int(np.argmax(env > env.max() * 0.1)), 'end': len(s)}[al]
        k0 = int(T(st) * SR) - off; a0 = max(0, k0); s2 = s[a0 - k0:]; b0 = min(N, a0 + len(s2)); outm[a0:b0] += s2[:b0 - a0]
    outm /= np.abs(outm).max() / db(-1)
    wavfile.write(out, SR, (outm * 32767).astype(np.int16))
    print(out, f'drop {exact:.3f}s of track -> video {T(4.05):.2f}s; music from {start:.2f}s; length {TOTAL:.1f}s')
EXACT = True  # drop times are read off the zoomed plots
if __name__ == '__main__':
    mix(sys.argv[1], float(sys.argv[2]), sys.argv[3])
