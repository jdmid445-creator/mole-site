# Parallax promo soundtrack v5 (original, synthesized). The video is re-timed so every key moment sits on a
# beat at 112 BPM; this score uses the same grid. Upbeat but calm: soft bass pulse on every beat, warm plucked
# arpeggio in eighths, pad chords that change on scene beats. No drums, no chimes, no whooshes: every "effect"
# is a musical note or chord in key.
import json
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
cfg = json.load(open('sync_points.json')); BPM = cfg['bpm']; SPB = 60 / BPM
TOTAL_BEATS = cfg['points'][-1][1]; TOTAL = TOTAL_BEATS * SPB
B = lambda beat: beat * SPB  # beat -> seconds
N = int((TOTAL + 1.0) * SR)
L = np.zeros(N); R = np.zeros(N)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
def lp(x, fc, o=2): return sosfilt(butter(o, fc, 'low', fs=SR, output='sos'), x)
def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR); j = min(N, i + len(sig))
    if i >= N: return
    gl = gain * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2); gr = gain * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    L[i:j] += sig[: j - i] * gl; R[i:j] += sig[: j - i] * gr
def env(n, a, r):
    e = np.ones(n); A = max(1, int(a * SR)); Rr = max(1, int(r * SR))
    e[:A] = np.linspace(0, 1, A) ** 1.5; e[-Rr:] *= np.linspace(1, 0, Rr) ** 1.5
    return e

# Key moments on the grid (beats), matching sync_points.json
LINE, CUT, BREAKS, PHONE, TYPE, QUOTE, TAP, STATUS, TRAVEL, ARRIVED, VIEWS, END = 1, 4, 6, 9, 11, 13, 14, 16, 17, 21, 24, 28

# Harmony: F major world, warm. Sections change on scene beats.
SECTIONS = [  # (from beat, to beat, chord notes, arpeggio notes, pad cutoff)
    (0, BREAKS, [38, 50, 57, 60, 64], [62, 65, 69, 72], 700),      # Dm9  (the trail)
    (BREAKS, PHONE, [41, 53, 57, 60, 64], [65, 69, 72, 76], 1000),  # Fmaj9 (breaks it)
    (PHONE, STATUS, [46, 53, 57, 62, 65], [62, 65, 69, 74], 1100),  # Bbmaj9 (the app)
    (STATUS, ARRIVED, [48, 55, 58, 62, 67], [64, 67, 70, 74], 1300),# C9sus-ish (in the tunnel)
    (ARRIVED, VIEWS, [41, 53, 57, 60, 64], [65, 69, 72, 77], 1600), # Fmaj9 (arrived)
    (VIEWS, END, [38, 50, 57, 60, 65], [62, 65, 69, 74], 1200),     # Dm (two views)
    (END, TOTAL_BEATS, [41, 48, 53, 57, 60, 64], [65, 69, 72, 76], 1100),  # F (end card)
]

# ---- pad ----
for b0, b1, chord, _, fc in SECTIONS:
    dur = B(b1 - b0) + 0.6; n = int(dur * SR); tt = np.arange(n) / SR
    pad = np.zeros(n)
    for m in chord:
        for det in (-0.08, 0.08):
            pad += np.sin(2 * np.pi * hz(m) * (1 + det / 100) * tt + np.random.rand() * 6) * (0.8 if m < 45 else 0.4)
            pad += 0.15 * np.sin(2 * np.pi * hz(m) * 2 * tt)
    pad = lp(pad, fc) * env(n, 0.25 if b0 else 1.0, 0.6) * 0.045
    add(pad, B(b0), pan=-0.15); add(pad, B(b0) + 0.012, pan=0.15)

# ---- bass pulse on every beat (soft, round; accented on key moments) ----
KEY = {CUT, BREAKS, PHONE, TAP, TRAVEL, ARRIVED, VIEWS, END}
def bass(m, strength):
    n = int(SPB * 0.95 * SR); tt = np.arange(n) / SR
    f = hz(m) * (1 + 0.6 * np.exp(-tt * 40))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.25 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return lp(s, 320) * np.exp(-tt * 3.2) * env(n, 0.004, 0.08) * strength
for beat in range(0, int(TOTAL_BEATS) - 1):
    sec = [s for s in SECTIONS if s[0] <= beat < s[1]][0]
    root = sec[2][0]
    ramp = 0.55 if beat < CUT else 1.0          # quieter before the line is cut
    acc = 1.35 if beat in KEY else (1.0 if beat % 2 == 0 else 0.8)
    add(bass(root, acc * ramp), B(beat), gain=0.42)

# ---- warm plucked arpeggio (eighths from the phone on; quarter notes before) ----
def pluck(m, dur=0.5, bright=2200):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * hz(m) * tt) + 0.35 * np.sin(2 * np.pi * hz(m) * 2 * tt) + 0.1 * np.sin(2 * np.pi * hz(m) * 3 * tt)
    return lp(s, bright) * np.exp(-tt * 7) * env(n, 0.003, 0.05)
for b0, b1, _, arp, _ in SECTIONS:
    step = 0.5 if b0 >= PHONE else 1.0
    k = b0 + (0 if b0 >= CUT else LINE)
    i = 0
    while k < b1 and k < TOTAL_BEATS - 2:
        pat = [0, 1, 2, 3, 2, 1, 2, 3] if step == 0.5 else [0, 2, 1, 3]
        m = arp[pat[i % len(pat)]]
        add(pluck(m), B(k), gain=0.075 if step == 0.5 else 0.06, pan=0.3 if i % 2 else -0.3)
        k += step; i += 1

# ---- musical "effects" ----
def stab(notes, dur=0.9, bright=2000):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * hz(m) * tt) + 0.3 * np.sin(4 * np.pi * hz(m) * tt) for m in notes)
    return lp(s, bright) * np.exp(-tt * 3.5) * env(n, 0.004, 0.2)
add(stab([57, 62, 65, 69]), B(CUT), gain=0.09)                         # creature cuts the line: chord stab
add(stab([53, 60, 65, 69], 1.6, 2400), B(BREAKS), gain=0.08)           # "Parallax breaks it."
for i, m in enumerate([69, 72, 74, 77]):                               # typing: four rising notes
    add(pluck(m, 0.35, 2600), B(TYPE + i * 0.5), gain=0.07, pan=0.35)
add(pluck(81, 0.5, 2600), B(QUOTE), gain=0.06, pan=0.35)               # price appears
add(stab([62, 65, 70], 0.6, 2200), B(TAP), gain=0.08, pan=0.3)         # tap on Swap
for i, m in enumerate([60, 64, 67, 70, 72, 74, 76]):                   # rising run through the tunnel
    add(pluck(m, 0.6, 1800 + 150 * i), B(TRAVEL + 0.5 + i * 0.5), gain=0.05 + 0.006 * i, pan=-0.3 + 0.1 * i)
add(stab([53, 57, 60, 64, 69], 2.2, 2600), B(ARRIVED), gain=0.11)      # Arrived: warm, full resolve
add(stab([50, 57, 62, 65], 1.2, 2000), B(VIEWS), gain=0.07)            # two views
add(stab([41, 53, 57, 60, 64, 69], 3.2, 2200), B(END), gain=0.12)      # end card

# ---- master ----
mix = np.stack([L, R], 1)[: int(TOTAL * SR)]
n = len(mix); f = np.ones(n); fi = int(0.3 * SR); fo = int(1.4 * SR)
f[:fi] = np.linspace(0, 1, fi); f[-fo:] = np.linspace(1, 0, fo) ** 1.2
mix *= f[:, None]
mix = np.tanh(mix * 1.5) / np.tanh(1.5)
mix /= np.max(np.abs(mix)) / 0.89
wavfile.write('soundtrack-v5.wav', SR, (mix * 32767).astype(np.int16))
print(f'{TOTAL:.2f}s at {BPM} BPM; key beats -> seconds:', {k: round(B(v), 2) for k, v in dict(cut=CUT, breaks=BREAKS, phone=PHONE, tap=TAP, travel=TRAVEL, arrived=ARRIVED, views=VIEWS, end=END).items()})
