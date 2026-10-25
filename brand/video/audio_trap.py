# Original soundtrack for the Parallax promo: synthesized from scratch (no samples, no licensing).
# Soft pad + light pulse + a few sound effects timed to the video's events.
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100

# Same timing plan as record-3d3.js: (story_start, story_end, speed) ; hold when start == end (value = seconds)
PLAN = [(0.0, 2.0, 1/1.1), (2.0, 3.5, 1/1.08), (3.5, 3.5, 0.6), (3.5, 4.1, 1/1.08), (4.1, 10.4, 1/1.08),
        (10.4, 10.4, 0.7), (10.4, 12.2, 1/1.08), (12.2, 12.2, 0.9), (12.2, 15.0, 1/1.05), (15.0, 15.0, 1.0)]
segs = []; T = 0.0
for a, b, sp in PLAN:
    d = sp if a == b else (b - a) / sp
    segs.append((T, T + d, a, b)); T += d
TOTAL = T

def at(story):
    """Video time (s) at which a story moment happens."""
    for T0, T1, a, b in segs:
        if a != b and a <= story <= b:
            return T0 + (story - a) / (b - a) * (T1 - T0)
    return TOTAL

N = int(TOTAL * SR) + SR // 2
t = np.arange(N) / SR
mixL = np.zeros(N); mixR = np.zeros(N)

def lowpass(x, fc, order=2):
    return sosfilt(butter(order, fc, 'low', fs=SR, output='sos'), x)

def highpass(x, fc, order=2):
    return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)

def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR); j = min(N, i + len(sig))
    if i >= N: return
    l = gain * np.cos((pan + 1) * np.pi / 4); r = gain * np.sin((pan + 1) * np.pi / 4)
    mixL[i:j] += sig[: j - i] * l * np.sqrt(2); mixR[i:j] += sig[: j - i] * r * np.sqrt(2)

def env_adsr(n, a, d, s, r):
    e = np.ones(n) * s
    A = int(a * SR); D = int(d * SR); R = int(r * SR)
    e[:A] = np.linspace(0, 1, A, endpoint=False)
    e[A:A + D] = np.linspace(1, s, D, endpoint=False)
    e[-R:] = np.linspace(e[-R - 1] if n > R else s, 0, R)
    return e

hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

# ---------- Option C: smooth chill-trap. 140 BPM half-time, 808 sub, rolling hats, airy pad, pluck melody ----------
bpm = 140; beat = 60 / bpm; bar = 4 * beat
prog_ = [[57, 64, 67, 72], [53, 60, 64, 69], [48, 55, 64, 67], [55, 62, 67, 71]]  # Am(add9-ish), F, C, G
roots_ = [45, 41, 48, 43]
# airy pad: soft sines with slow swell, wide
k = 0.0; ci = 0
while k < TOTAL:
    ch = prog_[ci % 4]; n = int((bar * 2 + 0.8) * SR); tt = np.arange(n) / SR
    pad = np.zeros(n)
    for m in ch:
        for det in (-0.15, 0.15):
            pad += np.sin(2 * np.pi * hz(m + 12) * (1 + det / 100) * tt) * 0.05
    pad = lowpass(pad, 3000) * env_adsr(n, 1.0, 0.6, 0.8, 0.9)
    add(pad, k, gain=0.5, pan=-0.35); add(pad, k + 0.012, gain=0.5, pan=0.35)
    k += bar * 2; ci += 1
# pluck melody (pentatonic, call-and-response), from the swap scene
mel = [76, 79, 81, 79, 76, 74, 72, 74, 76, 0, 79, 81, 84, 81, 79, 76]
k = at(4.1); j = 0
while k < TOTAL - 2.0:
    m = mel[j % len(mel)]
    if m:
        n = int(0.5 * SR); tt = np.arange(n) / SR
        pl = (np.sin(2 * np.pi * hz(m) * tt) + 0.25 * np.sin(2 * np.pi * hz(m) * 3 * tt)) * np.exp(-tt * 9)
        add(lowpass(pl, 4500), k, gain=0.09, pan=0.25 if j % 2 else -0.25)
        add(lowpass(pl, 2500), k + beat * 0.75, gain=0.035, pan=-0.4 if j % 2 else 0.4)  # soft echo
    k += beat / 2; j += 1
def k808(m, dur):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = hz(m) * (1 + 1.2 * np.exp(-tt * 30))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return np.tanh(2.2 * x) * np.exp(-tt * 1.6) * 0.8
def clap():
    n = int(0.3 * SR); tt = np.arange(n) / SR
    nz = sosfilt(butter(2, [900, 5000], 'band', fs=SR, output='sos'), np.random.randn(n))
    e = np.exp(-tt * 18) + 0.6 * np.exp(-np.maximum(tt - 0.012, 0) * 30) * (tt > 0.012)
    return nz * e * 0.6
def hat(g=1.0):
    n = int(0.04 * SR); tt = np.arange(n) / SR
    return highpass(np.random.randn(n), 8000) * np.exp(-tt * 90) * g
start = at(2.2)  # drop right as the creature cuts the line
k = start; step = 0
while k < TOTAL - 1.2:
    pos = step % 16  # 16th notes in a bar
    fade = min(1, (k - start) / 1.0)
    bi = int((k - 0) / (bar * 2)) % 4
    if pos == 0: add(k808(roots_[bi] - 12, bar * 0.9), k, gain=0.5 * fade)
    if pos == 10: add(k808(roots_[bi] - 12, beat * 1.2), k, gain=0.35 * fade)
    if pos == 8: add(clap(), k, gain=0.32 * fade, pan=0.05)
    if pos % 2 == 0: add(hat(), k, gain=0.07 * fade, pan=0.3)
    if pos in (13, 14, 15) and (step // 16) % 2 == 1:  # little hat roll every other bar
        for r in range(3): add(hat(0.7), k + r * beat / 12, gain=0.06 * fade, pan=0.3)
    k += beat / 4; step += 1

# ---------- Sound effects ----------
def tone(f0, f1, dur, decay, kind='sine'):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = np.linspace(f0, f1, n); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tt * decay)
def noise_sweep(dur, f0, f1, rise=True):
    n = int(dur * SR); x = np.random.randn(n)
    out = np.zeros(n); step = 512
    for s0 in range(0, n, step):
        frac = s0 / n; fc = f0 + (f1 - f0) * frac
        seg = x[s0:s0 + step]
        out[s0:s0 + step] = sosfilt(butter(2, [max(80, fc * 0.7), min(SR / 2 - 100, fc * 1.3)], 'band', fs=SR, output='sos'), seg)
    e = np.linspace(0, 1, n) ** 2 if rise else np.sin(np.linspace(0, np.pi, n))
    return out * e

# creature pops up through the line: bubbly pop + snap
add(tone(300, 900, 0.18, 22), at(2.1), gain=0.32)
add(highpass(np.random.randn(int(0.05 * SR)), 2500) * np.exp(-np.arange(int(0.05 * SR)) / SR * 90), at(2.2), gain=0.18)
# tap on Swap
add(tone(1800, 1200, 0.05, 80), at(6.45), gain=0.25, pan=0.35)
add(tone(220, 160, 0.12, 30), at(6.45), gain=0.25, pan=0.35)
# Arrived: bright chime (major triad, bell)
for m, dly in ((76, 0), (80, 0.06), (83, 0.12), (88, 0.18)):
    n = int(1.8 * SR); tt = np.arange(n) / SR
    bell = (np.sin(2 * np.pi * hz(m) * tt) + 0.4 * np.sin(2 * np.pi * hz(m) * 2.01 * tt)) * np.exp(-tt * 2.6)
    add(bell, at(9.85) + dly, gain=0.13, pan=0.25)
add(tone(300, 900, 0.18, 22), at(9.85), gain=0.2, pan=0.3)  # creature pops back
# end card: creature pop + shimmer
add(tone(300, 900, 0.18, 22), at(13.35), gain=0.26)
for m, dly in ((81, 0), (84, 0.08), (88, 0.16), (93, 0.24)):
    n = int(2.4 * SR); tt = np.arange(n) / SR
    add(np.sin(2 * np.pi * hz(m) * tt) * np.exp(-tt * 1.8), at(13.5) + dly, gain=0.07, pan=(-0.3 if dly % 0.16 else 0.3))

# ---------- Master: gentle fade in/out, soft limit ----------
mix = np.stack([mixL, mixR], axis=1)[: int(TOTAL * SR)]
n = len(mix)
fade = np.ones(n); fi = int(0.4 * SR); fo = int(1.6 * SR)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
mix *= fade[:, None]
mix = np.tanh(mix * 1.4) / np.tanh(1.4)
mix /= max(1e-9, np.max(np.abs(mix))) / 0.89
wavfile.write('soundtrack-trap.wav', SR, (mix * 32767).astype(np.int16))
print(f'soundtrack {TOTAL:.2f}s; events: pop {at(2.1):.2f}s, tap {at(6.45):.2f}s, arrived {at(9.85):.2f}s, end {at(13.35):.2f}s')
