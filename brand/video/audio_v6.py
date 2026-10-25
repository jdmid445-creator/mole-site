# Parallax promo soundtrack v6 (original, synthesized). Modern tech-launch sound on the video's 112 BPM grid:
# pumping saw pad, sub pulses, filtered 16th-note synth arp, and designed sound effects on every on-screen event.
import json
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
rng = np.random.default_rng(7)
cfg = json.load(open('sync_points.json')); BPM = cfg['bpm']; SPB = 60 / BPM
TOTAL_BEATS = cfg['points'][-1][1]; TOTAL = TOTAL_BEATS * SPB
B = lambda b: b * SPB
N = int((TOTAL + 1.5) * SR)
L = np.zeros(N); R = np.zeros(N)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
def lp(x, fc, o=2): return sosfilt(butter(o, min(fc, SR / 2 - 200), 'low', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return sosfilt(butter(o, fc, 'high', fs=SR, output='sos'), x)
def bp(x, f0, f1, o=2): return sosfilt(butter(o, [f0, min(f1, SR / 2 - 200)], 'band', fs=SR, output='sos'), x)
def add(sig, start, gain=1.0, pan=0.0, bus=None):
    i = int(start * SR)
    if i < 0: sig = sig[-i:]; i = 0
    j = min(N, i + len(sig))
    if i >= N: return
    gl = gain * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2); gr = gain * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    (bus or (L, R))[0][i:j] += sig[: j - i] * gl; (bus or (L, R))[1][i:j] += sig[: j - i] * gr
def env(n, a, r):
    e = np.ones(n); A = max(1, int(a * SR)); Rr = max(1, int(r * SR))
    e[:A] = np.linspace(0, 1, A) ** 1.5; e[-Rr:] *= np.linspace(1, 0, Rr) ** 1.5
    return e
def saw(f, tt): return 2 * ((f * tt) % 1) - 1
def sweep_lp(x, f0, f1, curve=1.0):
    out = np.zeros(len(x)); step = 1024
    for k in range(0, len(x), step):
        fr = (k / len(x)) ** curve; fc = f0 + (f1 - f0) * fr
        out[k:k + step] = lp(x[max(0, k - 2048):k + step], fc)[-len(x[k:k + step]):]
    return out

# beats (from sync_points.json)
LINE, CUT, BREAKS, PHONE, TYPE, QUOTE, TAP, STATUS, TRAVEL, ARRIVED, VIEWS, END = 1, 4, 6, 9, 11, 13, 14, 16, 17, 21, 24, 28
DIVE = 16.7; PEEK = 25.0

# ----------------------------- MUSIC BUS (gets sidechain pumping) -----------------------------
mL = np.zeros(N); mR = np.zeros(N); MB = (mL, mR)
SECTIONS = [  # (from, to, chord (midi), arp notes, pad cutoff, arp cutoff)
    (0, BREAKS,      [45, 57, 60, 64, 67], [69, 72, 76, 79], 600, 0),       # Am7, intro: pad only
    (BREAKS, PHONE,  [41, 53, 57, 60, 64], [65, 69, 72, 76], 1400, 1200),   # Fmaj7
    (PHONE, STATUS,  [36, 48, 55, 60, 64], [67, 72, 76, 79], 1800, 1800),   # C
    (STATUS, ARRIVED,[43, 55, 59, 62, 67], [67, 71, 74, 79], 1500, 1500),   # G (tension, arp filter sweeps up)
    (ARRIVED, VIEWS, [45, 57, 60, 64, 69], [69, 72, 76, 81], 2600, 2600),   # Am, opened up
    (VIEWS, END,     [41, 53, 57, 60, 65], [65, 69, 72, 77], 1800, 1600),   # F
    (END, TOTAL_BEATS, [45, 52, 57, 60, 64], [69, 72, 76, 79], 2000, 0),    # Am, logo
]
for b0, b1, chord, arp, pfc, afc in SECTIONS:
    dur = B(b1 - b0) + 0.5; n = int(dur * SR); tt = np.arange(n) / SR
    pad = np.zeros(n)
    for m in chord[1:]:
        for det in (-0.12, 0.0, 0.12):
            pad += saw(hz(m) * (1 + det / 100), tt + rng.random()) * 0.05
    pad = sweep_lp(pad, pfc * 0.7, pfc) * env(n, 0.04 if b0 else 0.9, 0.35)
    add(pad, B(b0), 0.55, -0.25, MB); add(pad, B(b0) + 0.013, 0.55, 0.25, MB)
    # sub/bass: saw through a low-pass, on every beat (8ths after the phone lands)
    step = 0.5 if b0 >= PHONE and b0 < END else 1.0
    k = b0
    while k < b1 and k < TOTAL_BEATS - 1:
        n2 = int(SPB * step * 0.9 * SR); t2 = np.arange(n2) / SR
        f = hz(chord[0] - 12 if b0 < END else chord[0] - 12)
        bs = lp(saw(f, t2) + 0.6 * np.sin(2 * np.pi * f * t2), 220) * np.exp(-t2 * 5) * env(n2, 0.003, 0.03)
        add(bs, B(k), 0.5 if k >= CUT else 0.25, 0, MB)
        k += step
    # 16th-note synth arp (filtered saw/square), from "breaks it" until the end card
    if afc:
        k = b0; i = 0
        pat = [0, 1, 2, 3, 2, 1, 3, 2]
        while k < b1:
            frac = (k - b0) / max(1, b1 - b0)
            fc = afc * (0.6 + 0.9 * frac) if b0 == STATUS else afc
            n3 = int(SPB * 0.25 * 1.4 * SR); t3 = np.arange(n3) / SR
            m = arp[pat[i % 8]]
            tone = saw(hz(m), t3) * 0.6 + np.sign(np.sin(2 * np.pi * hz(m) * 0.5 * t3)) * 0.25
            note = lp(tone, fc) * np.exp(-t3 * 16) * env(n3, 0.002, 0.02)
            add(note, B(k), 0.075, 0.35 if i % 2 else -0.35, MB)
            k += 0.25; i += 1

# sidechain pump on the music bus: duck on every beat after the cut
duck = np.ones(N)
for beat in range(CUT, int(TOTAL_BEATS) - 1):
    i = int(B(beat) * SR); n = int(SPB * SR)
    curve = 1 - 0.55 * np.exp(-np.arange(n) / SR * 9)
    duck[i:i + n] = np.minimum(duck[i:i + n], curve[: len(duck[i:i + n])])
mL *= duck; mR *= duck
L += mL; R += mR

# sub kick-free pulse (felt, under the pump) on each beat after the cut
def sub(strength=1.0):
    n = int(0.5 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(48 + 60 * np.exp(-tt * 30)) / SR) * np.exp(-tt * 7) * strength
for beat in range(CUT, int(TOTAL_BEATS) - 2):
    add(sub(1.0 if beat in (CUT, BREAKS, PHONE, TAP, TRAVEL, ARRIVED, VIEWS, END) else 0.55), B(beat), 0.35)

# ----------------------------- SOUND EFFECTS -----------------------------
def noise(n): return rng.standard_normal(n)
def impact(size=1.0):  # low boom + body
    n = int(1.6 * SR); tt = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(38 + 90 * np.exp(-tt * 12)) / SR) * np.exp(-tt * 2.8)
    body = lp(noise(n), 900) * np.exp(-tt * 9) * 0.5
    return (boom + body) * size
def snap():  # crisp transient
    n = int(0.12 * SR); tt = np.arange(n) / SR
    return bp(noise(n), 1800, 7000) * np.exp(-tt * 45)
def reverse_swell(dur):  # sucks into the next hit
    n = int(dur * SR); x = sweep_lp(noise(n), 300, 6000, curve=2.0)
    return x * (np.linspace(0, 1, n) ** 3)
def whoosh(dur=0.7, f0=400, f1=3500):
    n = int(dur * SR); x = noise(n); out = np.zeros(n); step = 1024
    for k in range(0, n, step):
        fr = k / n; c = f0 + (f1 - f0) * np.sin(np.pi * fr)
        out[k:k + step] = bp(x[max(0, k - 2048):k + step], c * 0.6, c * 1.4)[-len(x[k:k + step]):]
    return out * np.sin(np.linspace(0, np.pi, n)) ** 1.4
def key_tap():
    n = int(0.05 * SR); tt = np.arange(n) / SR
    return (bp(noise(n), 2000, 6000) * 0.6 + np.sin(2 * np.pi * 1100 * tt) * 0.5) * np.exp(-tt * 110)
def blip(f0, f1, dur=0.09):
    n = int(dur * SR); tt = np.arange(n) / SR
    sq = np.sign(np.sin(2 * np.pi * np.cumsum(np.linspace(f0, f1, n)) / SR))
    return lp(sq, 2500) * np.exp(-tt * 30) * env(n, 0.002, 0.02)
def button():
    n = int(0.25 * SR); tt = np.arange(n) / SR
    return bp(noise(n), 1500, 5000) * np.exp(-tt * 140) * 0.8 + np.sin(2 * np.pi * np.cumsum(220 * np.exp(-tt * 18) + 70) / SR) * np.exp(-tt * 22)
def swoop(f0, f1, dur):
    n = int(dur * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(np.geomspace(f0, f1, n)) / SR) * np.sin(np.linspace(0, np.pi, n))
def riser(dur):
    n = int(dur * SR); tt = np.arange(n) / SR
    tone = sum(saw(f, tt) for f in (np.geomspace(110, 880, n),)) if False else saw(1, tt)  # placeholder (unused)
    f = np.geomspace(110, 660, n); ph = np.cumsum(f) / SR
    syn = lp((2 * (ph % 1) - 1) + (2 * ((ph * 1.005) % 1) - 1), 3000) * 0.4
    nz = sweep_lp(noise(n), 400, 7000, curve=1.6) * 0.6
    return (syn + nz) * np.linspace(0, 1, n) ** 2
def stab(notes, dur=0.8, fc=3000):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = sum(saw(hz(m), tt) + saw(hz(m) * 1.004, tt) for m in notes) / len(notes)
    return sweep_lp(s, fc, fc * 0.25) * np.exp(-tt * 4) * env(n, 0.003, 0.15)

# line draws: accelerating digital ticks
ticks = 14
for i in range(ticks):
    fr = i / (ticks - 1); t0 = B(LINE) + (B(CUT) - B(LINE) - 0.15) * (1 - (1 - fr) ** 1.6)
    add(key_tap(), t0, 0.12 + 0.06 * fr, -0.6 + 1.2 * fr)
# the cut: reverse swell -> snap + impact + stab
add(reverse_swell(B(CUT) - B(LINE + 1)), B(LINE + 1), 0.18)
add(snap(), B(CUT), 0.45); add(impact(0.9), B(CUT), 0.42); add(stab([57, 64, 69, 72]), B(CUT), 0.22)
# "breaks it": bass drop
add(swoop(90, 38, 1.2), B(BREAKS), 0.45); add(impact(0.6), B(BREAKS), 0.25)
# phone flies in
add(whoosh(0.8, 300, 3000), B(PHONE) - 0.45, 0.28, 0.4); add(impact(0.5), B(PHONE), 0.2)
# typing: crisp UI taps on the half-beats
for i in range(4): add(key_tap(), B(TYPE + i * 0.5), 0.3, 0.35)
# price appears: data blip
add(blip(700, 1050), B(QUOTE), 0.22, 0.35); add(blip(1050, 1050, 0.07), B(QUOTE) + 0.09, 0.16, 0.35)
# tap on Swap: deep button click
add(button(), B(TAP), 0.5, 0.35)
# form -> status: short swipe
add(whoosh(0.35, 800, 2500), B(STATUS) - 0.1, 0.15, 0.3)
# creature dives
add(swoop(700, 160, 0.4), B(DIVE), 0.14, 0.3)
# tunnel: riser builds into Arrived, a half-beat gap of air, then the hit
add(riser(B(ARRIVED) - B(TRAVEL) - 0.05), B(TRAVEL), 0.2)
add(impact(1.0), B(ARRIVED), 0.45); add(snap(), B(ARRIVED), 0.3)
add(stab([57, 64, 69, 72, 76], 1.4, 3500), B(ARRIVED), 0.28)
add(blip(520, 780, 0.12), B(ARRIVED) + 0.05, 0.12, 0.3)
# two views: whoosh + low hit
add(whoosh(0.7, 300, 2600), B(VIEWS) - 0.35, 0.24); add(impact(0.5), B(VIEWS), 0.22)
# creature peeks: little boop
add(swoop(300, 620, 0.16), B(PEEK), 0.16)
# end card: reverse swell into a big logo hit
add(reverse_swell(B(2)), B(END - 2), 0.2)
add(impact(1.3), B(END), 0.55); add(snap(), B(END), 0.3); add(stab([45, 57, 64, 69, 72], 2.4, 3200), B(END), 0.32)

# ----------------------------- MASTER -----------------------------
mix = np.stack([L, R], 1)[: int(TOTAL * SR)]
n = len(mix); f = np.ones(n); fo = int(1.6 * SR); f[-fo:] = np.linspace(1, 0, fo) ** 1.3; f[:int(0.05 * SR)] = np.linspace(0, 1, int(0.05 * SR))
mix *= f[:, None]
mix = np.tanh(mix * 1.8) / np.tanh(1.8)
mix /= np.max(np.abs(mix)) / 0.89
wavfile.write('soundtrack-v6.wav', SR, (mix * 32767).astype(np.int16))
print(f'{TOTAL:.2f}s at {BPM} BPM')
