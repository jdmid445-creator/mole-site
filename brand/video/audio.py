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

# ---------- Pad: four chords, warm detuned saws through a low-pass ----------
chords = [[57, 64, 67, 71, 76], [53, 60, 64, 69, 72], [48, 55, 64, 67, 74], [55, 62, 67, 71, 74]]  # Am9, Fmaj7, Cadd9, G
chord_len = TOTAL / 4
for ci, ch in enumerate(chords):
    n = int((chord_len + 1.2) * SR); tt = np.arange(n) / SR
    sig = np.zeros(n)
    for m in ch:
        f = hz(m)
        for det in (-0.12, 0.0, 0.11):
            ph = np.random.rand() * 2 * np.pi
            sig += (2 * ((f * (1 + det / 100) * tt + ph / (2 * np.pi)) % 1) - 1) * 0.06
    sig = lowpass(sig, 1400 + 300 * ci, 2)
    sig *= env_adsr(n, 0.9, 0.5, 0.85, 1.4)
    add(sig, ci * chord_len - (0.3 if ci else 0), gain=0.55, pan=-0.15 + 0.1 * ci)

# ---------- Sub bass: root of each chord, gentle ----------
roots = [45, 41, 36, 43]
for ci, m in enumerate(roots):
    n = int((chord_len + 0.4) * SR); tt = np.arange(n) / SR
    sig = np.sin(2 * np.pi * hz(m) * tt) * env_adsr(n, 0.4, 0.3, 0.7, 0.8)
    add(sig, ci * chord_len, gain=0.28)

# ---------- Pulse: soft kick + airy tick at ~100 BPM, from the phone scene to the end ----------
beat = 60 / 100
def kick():
    n = int(0.35 * SR); tt = np.arange(n) / SR
    f = 110 * np.exp(-tt * 18) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 11)
def tick():
    n = int(0.06 * SR); x = highpass(np.random.randn(n), 7000, 2)
    return x * np.exp(-np.arange(n) / SR * 70)
start_pulse, end_pulse = at(4.1), TOTAL - 1.2
k = start_pulse
i = 0
while k < end_pulse:
    fade = min(1, (k - start_pulse) / 2.0)
    add(kick(), k, gain=0.32 * fade)
    add(tick(), k + beat / 2, gain=0.05 * fade, pan=0.3)
    k += beat; i += 1

# ---------- Pluck arpeggio in the phone scene (bell-like, quiet) ----------
arp = [69, 72, 76, 79, 76, 72]
k = at(4.4); j = 0
while k < at(10.4):
    m = arp[j % len(arp)]
    n = int(0.7 * SR); tt = np.arange(n) / SR
    sig = (np.sin(2 * np.pi * hz(m) * tt) + 0.3 * np.sin(2 * np.pi * hz(m) * 2 * tt)) * np.exp(-tt * 6)
    add(sig, k, gain=0.07, pan=0.4 if j % 2 else -0.4)
    k += beat / 2; j += 1

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

# line drawing: soft rising shimmer
add(noise_sweep(at(1.6) - at(0.8), 1500, 5000, rise=True), at(0.8), gain=0.05)
# creature pops up through the line: bubbly pop + snap
add(tone(300, 900, 0.18, 22), at(2.1), gain=0.32)
add(highpass(np.random.randn(int(0.05 * SR)), 2500) * np.exp(-np.arange(int(0.05 * SR)) / SR * 90), at(2.2), gain=0.18)
# "Parallax breaks it." soft low hit
add(tone(90, 55, 0.6, 7), at(3.0), gain=0.35)
# phone swings in: whoosh
add(noise_sweep(0.7, 400, 2500, rise=False), at(4.05), gain=0.22, pan=0.3)
# typing ticks
for s in (5.0, 5.15, 5.3, 5.45):
    add(highpass(np.random.randn(int(0.03 * SR)), 3000) * np.exp(-np.arange(int(0.03 * SR)) / SR * 140), at(s), gain=0.12, pan=0.35)
# quote appears: soft blip
add(tone(880, 1320, 0.15, 25), at(5.9), gain=0.12, pan=0.35)
# tap on Swap
add(tone(1800, 1200, 0.05, 80), at(6.45), gain=0.25, pan=0.35)
add(tone(220, 160, 0.12, 30), at(6.45), gain=0.25, pan=0.35)
# creature dives + coins cross: riser through the tunnel
add(tone(500, 180, 0.25, 12), at(7.7), gain=0.18, pan=0.3)
add(noise_sweep(at(9.75) - at(7.9), 300, 4000, rise=True), at(7.9), gain=0.12)
# Arrived: bright chime (major triad, bell)
for m, dly in ((76, 0), (80, 0.06), (83, 0.12), (88, 0.18)):
    n = int(1.8 * SR); tt = np.arange(n) / SR
    bell = (np.sin(2 * np.pi * hz(m) * tt) + 0.4 * np.sin(2 * np.pi * hz(m) * 2.01 * tt)) * np.exp(-tt * 2.6)
    add(bell, at(9.85) + dly, gain=0.13, pan=0.25)
add(tone(300, 900, 0.18, 22), at(9.85), gain=0.2, pan=0.3)  # creature pops back
# two views: gentle whoosh
add(noise_sweep(0.6, 600, 2200, rise=False), at(11.05), gain=0.14)
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
wavfile.write('soundtrack.wav', SR, (mix * 32767).astype(np.int16))
print(f'soundtrack {TOTAL:.2f}s; events: pop {at(2.1):.2f}s, tap {at(6.45):.2f}s, arrived {at(9.85):.2f}s, end {at(13.35):.2f}s')
