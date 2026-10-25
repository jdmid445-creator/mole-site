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

# ---------- Option B: lo-fi. Electric piano chords, dusty beat at 86 BPM, vinyl crackle ----------
bpm = 86; beat = 60 / bpm; bar = 4 * beat
def epiano(m, dur):
    n = int(dur * SR); tt = np.arange(n) / SR; f = hz(m)
    trem = 1 + 0.08 * np.sin(2 * np.pi * 4.5 * tt)
    s_ = (np.sin(2 * np.pi * f * tt + 0.9 * np.sin(2 * np.pi * f * 2 * tt) * np.exp(-tt * 3)) * np.exp(-tt * 0.9)) * trem
    return lowpass(s_, 2600) * env_adsr(n, 0.01, 0.4, 0.75, 0.6)
prog_ = [[57, 60, 64, 67, 71], [53, 57, 60, 64, 67], [50, 53, 57, 60, 64], [52, 56, 59, 62, 66]]  # Am9, Fmaj9, Dm9, E7(b9-ish)
k = 0.0; ci = 0
while k < TOTAL:
    ch = prog_[ci % 4]
    for idx, m in enumerate(ch):
        add(epiano(m, bar * 0.95), k + idx * 0.018, gain=0.11, pan=-0.2 + 0.1 * idx)
    # a lazy second hit on the "and" of 3
    for idx, m in enumerate(ch[1:4]):
        add(epiano(m + 12, beat * 1.2), k + 2.5 * beat + idx * 0.015, gain=0.05, pan=0.25)
    add(np.sin(2 * np.pi * hz(ch[0] - 12) * np.arange(int(bar * SR)) / SR) * env_adsr(int(bar * SR), 0.02, 0.3, 0.6, 0.3), k, gain=0.22)
    k += bar; ci += 1
def kick():
    n = int(0.4 * SR); tt = np.arange(n) / SR
    f = 95 * np.exp(-tt * 20) + 48
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)
def snare():
    n = int(0.25 * SR); tt = np.arange(n) / SR
    body = np.sin(2 * np.pi * 190 * tt) * np.exp(-tt * 25)
    nz = sosfilt(butter(2, [1200, 6000], 'band', fs=SR, output='sos'), np.random.randn(n)) * np.exp(-tt * 16)
    return lowpass(0.5 * body + 0.8 * nz, 5000)
def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR); tt = np.arange(n) / SR
    return highpass(np.random.randn(n), 6500) * np.exp(-tt * (14 if open_ else 75))
beat_in = at(1.9)
k = beat_in; step = 0
while k < TOTAL - 1.0:
    pos = step % 8  # eighth notes
    sw = 0.06 * beat if pos % 2 else 0  # swing
    fade = min(1, (k - beat_in) / 1.5)
    if pos in (0, 5): add(kick(), k + sw, gain=0.42 * fade)
    if pos in (2, 6): add(snare(), k + sw, gain=0.26 * fade, pan=0.05)
    add(hat(pos == 7), k + sw, gain=(0.06 if pos % 2 else 0.09) * fade, pan=0.35)
    k += beat / 2; step += 1
crackle = np.zeros(N); idx = np.random.choice(N, int(TOTAL * 18), replace=False)
crackle[idx] = np.random.randn(len(idx)) * 0.6
crackle = lowpass(highpass(crackle + np.random.randn(N) * 0.004, 900), 6000)
mixL += crackle * 0.12; mixR += np.roll(crackle, 333) * 0.12

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
wavfile.write('soundtrack-lofi.wav', SR, (mix * 32767).astype(np.int16))
print(f'soundtrack {TOTAL:.2f}s; events: pop {at(2.1):.2f}s, tap {at(6.45):.2f}s, arrived {at(9.85):.2f}s, end {at(13.35):.2f}s')
