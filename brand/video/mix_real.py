# Soundtrack built ONLY from downloaded Pixabay audio (user-supplied files in dl/). No synthesis.
# The track's drop is placed on the phone landing; SFX sit on top of the music on their events. No ducking.
import json, sys, numpy as np
from scipy.io import wavfile
SR = 44100
c = json.load(open('sync_points.json')); spb = 60 / c['bpm']; P = [(s, b * spb) for s, b in c['points']]; TOTAL = P[-1][1]
def T(story):  # story time -> video seconds
    for (s0, t0), (s1, t1) in zip(P, P[1:]):
        if s0 <= story <= s1 and s1 > s0: return t0 + (story - s0) / (s1 - s0) * (t1 - t0)
def load(n):
    sr, x = wavfile.read(f'dl/{n}.wav'); return x.astype(float) / 32768
db = lambda d: 10 ** (d / 20)
TRACKS = {'prettyjohn': 13.22, 'futurepop': 12.58, 'alexmorgan': 15.93}
SFX = [  # (story time, file, gain dB vs. full scale peak, align on 'peak' or 'onset')
    (1.98, 's_pop', -13, 'peak'),        # creature pops through the line
    (3.0, 's_swish', -22, 'peak'),       # "Parallax breaks that trail."
    (4.3, 's_woosh', -14, 'peak'),       # phone swings in
    (5.05, 's_pop', -19, 'peak'),        # creature peeks on the phone
    *[(5.0 + 0.15 * i, 's_click1', -18, 'onset') for i in range(4)],  # typing
    (6.45, 's_click2', -12, 'onset'),    # tap Swap
    (7.72, 's_woosh', -19, 'peak'),      # creature dives
    (8.2, 's_swish', -19, 'peak'),       # coins travel
    (9.85, 's_notif1', -15, 'onset'),    # Arrived
    (9.9, 's_pop', -20, 'peak'),         # creature pops back
    (11.05, 's_woosh', -17, 'peak'),     # two views
    (11.65, 's_pop', -20, 'peak'),       # creature peeks
    (13.25, 's_woosh', -15, 'peak'),     # end card
    (13.4, 's_pop', -18, 'peak'),        # end creature
]
def offs(x):
    e = np.abs(x).max(1); return e.argmax(), np.argmax(e > e.max() * 0.1)
for name, drop in TRACKS.items():
    m = load('m_' + name); start = drop - T(4.05); i0 = int(start * SR); n = int(TOTAL * SR)
    mus = m[i0:i0 + n].copy()
    fi, fo = int(0.6 * SR), int(2.6 * SR)
    mus[:fi] *= np.linspace(0, 1, fi)[:, None] ** 2; mus[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.6
    mus *= db(-3) / np.abs(mus).max()
    out = mus.copy()
    for st, f, g, al in SFX:
        s = load(f); s = s / np.abs(s).max() * db(g); pk, on = offs(s)
        k = int(T(st) * SR) - (pk if al == 'peak' else on); a = max(0, k); s = s[a - k:]; b = min(n, a + len(s))
        out[a:b] += s[:b - a]
    out /= np.abs(out).max() / db(-1)
    wavfile.write(f'mix-{name}.wav', SR, (out * 32767).astype(np.int16))
    print(name, f'music from {start:.2f}s of the track, drop at {T(4.05):.2f}s in video')
