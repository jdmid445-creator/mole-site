# Parallax promo soundtrack, scored to the picture (original, synthesized; no samples).
# Idea: the music IS the edit. A deep soft pulse lands on every key moment, quieter pulses fill evenly
# between them like a slow heartbeat, chords change exactly at scene changes, and a filter opens while
# the coins travel through the tunnel and resolves on "Arrived". No drums, no chimes.
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
PLAN = [(0.0, 2.0, 1/1.1), (2.0, 3.5, 1/1.08), (3.5, 3.5, 0.6), (3.5, 4.1, 1/1.08), (4.1, 10.4, 1/1.08),
        (10.4, 10.4, 0.7), (10.4, 12.2, 1/1.08), (12.2, 12.2, 0.9), (12.2, 15.0, 1/1.05), (15.0, 15.0, 1.0)]
segs = []; T = 0.0
for a, b, sp in PLAN:
    d = sp if a == b else (b - a) / sp
    segs.append((T, T + d, a, b)); T += d
TOTAL = T
def at(story):
    for T0, T1, a, b in segs:
        if a != b and a <= story <= b:
            return T0 + (story - a) / (b - a) * (T1 - T0)
    return TOTAL

N = int(TOTAL * SR) + SR
L = np.zeros(N); R = np.zeros(N)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
def lp(x, fc, o=2): return sosfilt(butter(o, fc, 'low', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return sosfilt(butter(o, fc, 'high', fs=SR, output='sos'), x)
def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR); j = min(N, i + len(sig))
    if i >= N or j <= 0: return
    gl = gain * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2); gr = gain * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    L[i:j] += sig[: j - i] * gl; R[i:j] += sig[: j - i] * gr
def env(n, a, r):
    e = np.ones(n); A = max(1, int(a * SR)); Rr = max(1, int(r * SR))
    e[:A] = np.linspace(0, 1, A) ** 1.5; e[-Rr:] *= np.linspace(1, 0, Rr) ** 1.5
    return e

# ---- key moments (video seconds) ----
E = {
    'start': 0.35, 'line': at(0.8), 'cut': at(2.15), 'breaks': at(3.0), 'phone': at(4.05), 'type': at(5.0),
    'quote': at(5.9), 'tap': at(6.45), 'status': at(7.3), 'dive': at(7.7), 'travel': at(7.9), 'arrived': at(9.85),
    'views': at(11.05), 'peek': at(11.6), 'end': at(13.25), 'out': TOTAL,
}

# ---- chords change exactly on scene changes (low, warm voicings) ----
SECTIONS = [  # (start, end, notes, base cutoff, end cutoff)
    (0.0,        E['breaks'],  [38, 50, 53, 57, 60, 64], 500, 800),    # Dm9: "every swap leaves a trail"
    (E['breaks'], E['phone'],  [41, 53, 57, 60, 64, 67], 800, 1000),   # Fmaj9: "Parallax breaks it"
    (E['phone'],  E['travel'], [34, 46, 50, 53, 57, 62], 900, 1100),   # Bbmaj9: the app
    (E['travel'], E['arrived'],[36, 48, 52, 55, 58, 62], 600, 2200),   # C9sus: tunnel, filter opens
    (E['arrived'],E['views'],  [41, 53, 57, 60, 64, 69], 1600, 1300),  # Fmaj9 resolve: arrived
    (E['views'],  E['end'],    [38, 50, 53, 57, 60, 65], 1000, 1100),  # Dm: two views
    (E['end'],    TOTAL,       [41, 48, 53, 57, 60, 64], 1200, 700),   # F: end card, fade
]
for (s0, s1, notes, c0, c1) in SECTIONS:
    dur = s1 - s0 + 1.4; n = int(dur * SR); tt = np.arange(n) / SR
    tone = np.zeros(n)
    for m in notes:
        for det in (-0.09, 0.09):
            ph = np.random.rand() * 2 * np.pi
            tone += np.sin(2 * np.pi * hz(m) * (1 + det / 100) * tt + ph) * (0.9 if m < 45 else 0.45)
            tone += 0.12 * np.sin(2 * np.pi * hz(m) * 2 * (1 + det / 100) * tt + ph)
    # time-varying low-pass (cutoff glides from c0 to c1)
    out = np.zeros(n); step = 1024
    for k in range(0, n, step):
        fc = c0 + (c1 - c0) * min(1, k / max(1, (s1 - s0) * SR))
        out[k:k + step] = lp(tone[max(0, k - 2048):k + step], fc)[-len(tone[k:k + step]):]
    out *= env(n, 0.9 if s0 > 0 else 1.6, 1.4) * 0.05
    add(out, s0 - (0.5 if s0 > 0 else 0), gain=1.0, pan=-0.12); add(out, s0 - (0.5 if s0 > 0 else 0) + 0.011, gain=1.0, pan=0.12)

# ---- the pulse: deep and soft, felt more than heard ----
def pulse(strength=1.0):
    n = int(1.1 * SR); tt = np.arange(n) / SR
    f = 52 + 30 * np.exp(-tt * 14)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 4.2)
    click = lp(np.random.randn(n), 400) * np.exp(-tt * 60) * 0.25
    return lp(body + click, 260) * env(n, 0.006, 0.4) * strength
main_hits = ['cut', 'breaks', 'phone', 'tap', 'travel', 'arrived', 'views', 'end']
soft_hits = ['line', 'type', 'quote', 'status', 'peek']
for k in main_hits: add(pulse(1.0), E[k], gain=0.55)
for k in soft_hits: add(pulse(0.55), E[k], gain=0.45)
# heartbeat filler: evenly spaced quiet pulses between consecutive key moments (~1.2 s apart)
keys = sorted([E[k] for k in main_hits + soft_hits] + [E['start']])
for a_, b_ in zip(keys, keys[1:] + [TOTAL - 1.4]):
    gap = b_ - a_
    if gap < 1.6: continue
    n_fill = int(round(gap / 1.25)) - 1
    for i in range(1, n_fill + 1):
        add(pulse(0.4), a_ + gap * i / (n_fill + 1), gain=0.38)

# ---- accents that move with the picture ----
def swell(dur, f0, f1, rising=True):
    n = int(dur * SR); x = np.random.randn(n); out = np.zeros(n); step = 1024
    for k in range(0, n, step):
        fr = k / n; fc = f0 + (f1 - f0) * (fr if rising else 1 - fr)
        out[k:k + step] = lp(x[max(0, k - 2048):k + step], fc)[-len(x[k:k + step]):]
    e = (np.linspace(0, 1, n) ** 2) if rising else np.sin(np.linspace(0, np.pi, n)) ** 1.5
    return out * e
# the line draws: low air rising
add(swell(E['cut'] - E['line'], 200, 900), E['line'], gain=0.05)
# creature bursts through: soft round "whump" (low, not a pop)
def whump():
    n = int(0.45 * SR); tt = np.arange(n) / SR
    return lp(np.sin(2 * np.pi * (140 * np.exp(-tt * 9) + 70) * tt), 500) * np.exp(-tt * 9)
add(whump(), E['cut'], gain=0.35)
# phone swings in: airy whoosh, kept dark
add(swell(0.9, 300, 1500, rising=False), E['phone'] - 0.2, gain=0.09, pan=0.35)
# typing: very soft, low clicks
for i in range(4):
    n = int(0.03 * SR); c = lp(hp(np.random.randn(n), 800), 2500) * np.exp(-np.arange(n) / SR * 120)
    add(c, E['type'] + i * (at(5.15) - at(5.0)), gain=0.06, pan=0.35)
# tap: a soft muted tick on the pulse
n = int(0.08 * SR); add(lp(np.random.randn(n), 1800) * np.exp(-np.arange(n) / SR * 70), E['tap'], gain=0.12, pan=0.35)
# dive + tunnel: the creature drops, then a riser that opens up through the travel and lands on Arrived
add(whump()[::-1][: int(0.3 * SR)] * np.linspace(0, 1, int(0.3 * SR)), E['dive'] - 0.3, gain=0.18)
add(swell(E['arrived'] - E['travel'], 150, 2400), E['travel'], gain=0.075)
# arrived: warm resolve bloom
n = int(2.6 * SR); tt = np.arange(n) / SR
bloom = sum(np.sin(2 * np.pi * hz(m) * tt) for m in (53, 57, 60, 64)) * 0.25
add(lp(bloom, 1300) * env(n, 0.12, 1.8), E['arrived'], gain=0.18)
add(whump(), E['arrived'] + 0.02, gain=0.22)
# two views: gentle dark whoosh; creature peeks: tiny whump
add(swell(0.8, 250, 1200, rising=False), E['views'] - 0.15, gain=0.07)
add(whump(), E['peek'], gain=0.18)
# end card: final whump + long low bloom
add(whump(), E['end'] + 0.1, gain=0.28)
n = int(4.0 * SR); tt = np.arange(n) / SR
end_bloom = sum(np.sin(2 * np.pi * hz(m) * tt * (1 + d / 100)) for m in (41, 53, 57, 60, 64) for d in (-0.1, 0.1)) * 0.12
add(lp(end_bloom, 900) * env(n, 0.4, 2.6), E['end'], gain=0.26)

# ---- a faint air bed for texture ----
bed = lp(hp(np.random.randn(N), 300), 2500) * 0.004
L += bed; R += np.roll(bed, 777)

# ---- master ----
mix = np.stack([L, R], 1)[: int(TOTAL * SR)]
n = len(mix); f = np.ones(n); fi = int(0.5 * SR); fo = int(1.8 * SR)
f[:fi] = np.linspace(0, 1, fi); f[-fo:] = np.linspace(1, 0, fo) ** 1.3
mix *= f[:, None]
mix = np.tanh(mix * 1.6) / np.tanh(1.6)
mix /= np.max(np.abs(mix)) / 0.89
wavfile.write('soundtrack-sync.wav', SR, (mix * 32767).astype(np.int16))
print('length %.2fs' % TOTAL)
for k in ['line', 'cut', 'breaks', 'phone', 'tap', 'dive', 'travel', 'arrived', 'views', 'end']:
    print(f'  {k:8s} {E[k]:6.2f}s')
