# Three different soundtrack directions for the Parallax promo (original, synthesized, no samples).
# All share: the video's 112 BPM grid, the v6 sound effects the owner liked, steady volume (no ducking, no gaps).
import json, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
cfg = json.load(open('sync_points.json')); BPM = cfg['bpm']; SPB = 60 / BPM
TOTAL_BEATS = cfg['points'][-1][1]; TOTAL = TOTAL_BEATS * SPB
B = lambda b: b * SPB
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
def lp(x, fc, o=2): return sosfilt(butter(o, min(fc, SR / 2 - 200), 'low', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return sosfilt(butter(o, fc, 'high', fs=SR, output='sos'), x)
def bp(x, f0, f1, o=2): return sosfilt(butter(o, [f0, min(f1, SR / 2 - 200)], 'band', fs=SR, output='sos'), x)
def saw(f, tt): return 2 * ((f * tt) % 1) - 1
def env(n, a, r):
    e = np.ones(n); A = max(1, int(a * SR)); Rr = max(1, int(r * SR))
    e[:A] = np.linspace(0, 1, A) ** 1.5; e[-Rr:] *= np.linspace(1, 0, Rr) ** 1.5
    return e
def sweep_lp(x, f0, f1, curve=1.0):
    out = np.zeros(len(x)); step = 1024
    for k in range(0, len(x), step):
        fc = f0 + (f1 - f0) * (k / len(x)) ** curve
        out[k:k + step] = lp(x[max(0, k - 2048):k + step], fc)[-len(x[k:k + step]):]
    return out

LINE, CUT, BREAKS, PHONE, TYPE, QUOTE, TAP, STATUS, TRAVEL, ARRIVED, VIEWS, END = 1, 4, 6, 9, 11, 13, 14, 16, 17, 21, 24, 28
DIVE, PEEK = 16.7, 25.0
# harmony per section (A minor world): (from beat, to beat, chord)
HARM = [(0, BREAKS, [45, 57, 60, 64, 67]), (BREAKS, PHONE, [41, 53, 57, 60, 64]), (PHONE, STATUS, [36, 48, 55, 60, 64]),
        (STATUS, ARRIVED, [43, 55, 59, 62, 67]), (ARRIVED, VIEWS, [45, 57, 60, 64, 69]), (VIEWS, END, [41, 53, 57, 60, 65]),
        (END, TOTAL_BEATS, [45, 52, 57, 60, 64])]
def chord_at(beat): return [h for h in HARM if h[0] <= beat < h[1]][0][2]

class Mix:
    def __init__(self):
        self.N = int((TOTAL + 2) * SR); self.L = np.zeros(self.N); self.R = np.zeros(self.N)
        self.rng = np.random.default_rng(11)
    def add(self, sig, start, gain=1.0, pan=0.0):
        i = int(start * SR)
        if i < 0: sig = sig[-i:]; i = 0
        j = min(self.N, i + len(sig))
        if i >= self.N: return
        gl = gain * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2); gr = gain * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
        self.L[i:j] += sig[: j - i] * gl; self.R[i:j] += sig[: j - i] * gr
    def noise(self, n): return self.rng.standard_normal(n)

# ------------------------------ instruments ------------------------------
def kick(m, punch=1.0):
    n = int(0.45 * SR); tt = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(50 + 150 * np.exp(-tt * 35)) / SR) * np.exp(-tt * 7)
    return np.tanh(1.5 * punch * (body + hp(m.noise(n), 2500) * np.exp(-tt * 300) * 0.3))
def clap(m):
    n = int(0.35 * SR); tt = np.arange(n) / SR; nz = bp(m.noise(n), 900, 6500)
    e = sum(np.exp(-np.maximum(tt - d, 0) * 60) * (tt >= d) for d in (0, 0.011, 0.022)) * 0.6 + np.exp(-tt * 13) * 0.5
    return nz * e
def hat(m, open_=False):
    n = int((0.22 if open_ else 0.045) * SR); tt = np.arange(n) / SR
    return hp(m.noise(n), 7500) * np.exp(-tt * (11 if open_ else 95))
def supersaw(notes, dur, fc, voices=5, spread=0.25):
    n = int(dur * SR); tt = np.arange(n) / SR; s = np.zeros(n)
    rng = np.random.default_rng(3)
    for m_ in notes:
        for v in range(voices):
            det = (v - (voices - 1) / 2) / ((voices - 1) / 2) * spread
            s += saw(hz(m_) * (1 + det / 100), tt + rng.random())
    return lp(s / (len(notes) * voices) * 2.2, fc)

# ------------------------------ shared sound effects (v6 set, no gap) ------------------------------
def sfx(m):
    def impact(size=1.0):
        n = int(1.6 * SR); tt = np.arange(n) / SR
        return (np.sin(2 * np.pi * np.cumsum(38 + 90 * np.exp(-tt * 12)) / SR) * np.exp(-tt * 2.8) + lp(m.noise(n), 900) * np.exp(-tt * 9) * 0.5) * size
    def snap():
        n = int(0.12 * SR); return bp(m.noise(n), 1800, 7000) * np.exp(-np.arange(n) / SR * 45)
    def reverse_swell(dur):
        n = int(dur * SR); return sweep_lp(m.noise(n), 300, 6000, 2.0) * (np.linspace(0, 1, n) ** 3)
    def whoosh(dur=0.7, f0=400, f1=3500):
        n = int(dur * SR); x = m.noise(n); out = np.zeros(n)
        for k in range(0, n, 1024):
            c = f0 + (f1 - f0) * np.sin(np.pi * k / n)
            out[k:k + 1024] = bp(x[max(0, k - 2048):k + 1024], c * 0.6, c * 1.4)[-len(x[k:k + 1024]):]
        return out * np.sin(np.linspace(0, np.pi, n)) ** 1.4
    def key_tap():
        n = int(0.05 * SR); tt = np.arange(n) / SR
        return (bp(m.noise(n), 2000, 6000) * 0.6 + np.sin(2 * np.pi * 1100 * tt) * 0.5) * np.exp(-tt * 110)
    def blip(f0, f1, dur=0.09):
        n = int(dur * SR); tt = np.arange(n) / SR
        return lp(np.sign(np.sin(2 * np.pi * np.cumsum(np.linspace(f0, f1, n)) / SR)), 2500) * np.exp(-tt * 30) * env(n, 0.002, 0.02)
    def button():
        n = int(0.25 * SR); tt = np.arange(n) / SR
        return bp(m.noise(n), 1500, 5000) * np.exp(-tt * 140) * 0.8 + np.sin(2 * np.pi * np.cumsum(220 * np.exp(-tt * 18) + 70) / SR) * np.exp(-tt * 22)
    def swoop(f0, f1, dur):
        n = int(dur * SR); return np.sin(2 * np.pi * np.cumsum(np.geomspace(f0, f1, n)) / SR) * np.sin(np.linspace(0, np.pi, n))
    def riser(dur):
        n = int(dur * SR); ph = np.cumsum(np.geomspace(110, 660, n)) / SR
        return (lp((2 * (ph % 1) - 1) + (2 * ((ph * 1.005) % 1) - 1), 2500) * 0.6 + sweep_lp(m.noise(n), 400, 4000, 1.6) * 0.15) * np.linspace(0, 1, n) ** 2
    for i in range(14):
        fr = i / 13; m.add(key_tap(), B(LINE) + (B(CUT) - B(LINE) - 0.15) * (1 - (1 - fr) ** 1.6), 0.12 + 0.06 * fr, -0.6 + 1.2 * fr)
    m.add(reverse_swell(B(CUT) - B(LINE + 1)), B(LINE + 1), 0.18)
    m.add(snap(), B(CUT), 0.45); m.add(impact(0.9), B(CUT), 0.42)
    m.add(swoop(90, 38, 1.2), B(BREAKS), 0.4); m.add(impact(0.6), B(BREAKS), 0.25)
    m.add(whoosh(0.8, 300, 3000), B(PHONE) - 0.45, 0.3, 0.4); m.add(impact(0.7), B(PHONE), 0.28)
    for i in range(4): m.add(key_tap(), B(TYPE + i * 0.5), 0.3, 0.35)
    m.add(blip(700, 1050), B(QUOTE), 0.22, 0.35); m.add(blip(1050, 1050, 0.07), B(QUOTE) + 0.09, 0.16, 0.35)
    m.add(button(), B(TAP), 0.5, 0.35)
    m.add(whoosh(0.35, 800, 2500), B(STATUS) - 0.1, 0.08, 0.3)
    m.add(swoop(700, 160, 0.4), B(DIVE), 0.14, 0.3)
    m.add(riser(B(ARRIVED) - B(TRAVEL) - 0.02), B(TRAVEL), 0.045)  # quiet: sits under the music
    m.add(impact(0.8), B(ARRIVED), 0.2); m.add(snap(), B(ARRIVED), 0.1)
    m.add(whoosh(0.7, 300, 2600), B(VIEWS) - 0.35, 0.24); m.add(impact(0.5), B(VIEWS), 0.22)
    m.add(swoop(300, 620, 0.16), B(PEEK), 0.16)
    m.add(reverse_swell(B(2)), B(END - 2), 0.2)
    m.add(impact(1.2), B(END), 0.5); m.add(snap(), B(END), 0.3)

# ------------------------------ A: tech house ------------------------------
def option_a(m):
    for b0, b1, ch in HARM:  # stab chords on the off-beats, warm pad underneath
        n = int((B(b1 - b0) + 0.4) * SR)
        m.add(supersaw(ch[1:], B(b1 - b0) + 0.4, 1100, 3, 0.12) * env(n, 0.3 if b0 else 1.0, 0.3), B(b0), 0.35)
        if b0 >= BREAKS and b0 < END:
            k = b0 + 0.5
            while k < b1:
                n2 = int(0.22 * SR); m.add(supersaw(ch[1:4], 0.22, 2600, 3, 0.15) * np.exp(-np.arange(n2) / SR * 14), B(k), 0.3, 0.15)
                k += 1
    beat = 0.0
    while beat < END:  # rolling bassline in 8ths (root, root, octave, fifth)
        ch = chord_at(beat); pat = [0, 0, 12, 7]
        if beat >= CUT:
            n = int(SPB * 0.45 * SR); tt = np.arange(n) / SR; f = hz(ch[0] - 12 + pat[int(beat * 2) % 4])
            m.add(lp(saw(f, tt) + 0.5 * np.sin(2 * np.pi * f * tt), 420) * np.exp(-tt * 6) * env(n, 0.003, 0.03), B(beat), 0.3)
        beat += 0.5
    for beat in range(BREAKS, END):
        if beat >= PHONE: m.add(kick(m), B(beat), 0.5)
        if beat >= PHONE and (beat - PHONE) % 2 == 1: m.add(clap(m), B(beat), 0.22)
        m.add(hat(m, open_=True), B(beat + 0.5), 0.07 if beat >= PHONE else 0.045, 0.3)
        if beat >= STATUS:
            for h in (0.25, 0.75): m.add(hat(m), B(beat + h), 0.05, -0.3)
    m.add(kick(m), B(END), 0.5)

# ------------------------------ B: cinematic ------------------------------
def option_b(m):
    for b0, b1, ch in HARM:  # big wide chords, swelling at each section
        n = int((B(b1 - b0) + 0.8) * SR)
        bright = 1800 if b0 >= PHONE else 900
        m.add(supersaw([c + 12 for c in ch[1:]] + ch[1:3], B(b1 - b0) + 0.8, bright, 5, 0.3) * env(n, 0.35 if b0 else 1.2, 0.6), B(b0), 0.42)
    beat = CUT
    while beat < END:  # pulsing 16th bass ostinato
        ch = chord_at(beat); n = int(SPB * 0.23 * SR); tt = np.arange(n) / SR; f = hz(ch[0] - 12)
        acc = 1.0 if (beat * 4) % 4 == 0 else 0.6
        m.add(lp(saw(f, tt) + saw(f * 1.003, tt), 600 if beat >= PHONE else 350) * np.exp(-tt * 10) * acc, B(beat), 0.22)
        beat += 0.25
    def tom(f0, size=1.0):
        n = int(0.6 * SR); tt = np.arange(n) / SR
        return (np.sin(2 * np.pi * np.cumsum(f0 * (1 + 0.5 * np.exp(-tt * 20))) / SR) * np.exp(-tt * 6) + lp(m.noise(n), 1500) * np.exp(-tt * 20) * 0.3) * size
    for beat in range(PHONE, END):  # driving toms on 1 and the "and" of 2, bigger in the tunnel
        m.add(tom(75), B(beat), 0.38 if beat % 2 == 0 else 0.25)
        if beat % 2 == 1: m.add(tom(110, 0.8), B(beat + 0.5), 0.22, 0.2)
        if STATUS <= beat < ARRIVED:
            for h in (0.25, 0.75): m.add(tom(140, 0.5), B(beat + h), 0.15, -0.2)
    for b in (CUT, BREAKS, PHONE, ARRIVED, VIEWS, END):  # orchestral-style boom on every big moment
        n = int(2.5 * SR); tt = np.arange(n) / SR
        m.add(np.sin(2 * np.pi * np.cumsum(32 + 40 * np.exp(-tt * 6)) / SR) * np.exp(-tt * 1.6), B(b), 0.3)

# ------------------------------ C: future bass ------------------------------
def option_c(m):
    for b0, b1, ch in HARM:  # pad underneath
        n = int((B(b1 - b0) + 0.5) * SR)
        m.add(supersaw(ch[1:], B(b1 - b0) + 0.5, 900, 3, 0.2) * env(n, 0.3 if b0 else 1.0, 0.4), B(b0), 0.3)
    # bouncy supersaw chord rhythm (3-3-2 feel) from the phone on, with a volume "swell" shape per hit
    rhythm = [0, 0.75, 1.5, 2.5, 3.0, 3.5]
    for bar in range(PHONE, END, 4):
        for r in rhythm:
            k = bar + r
            if k >= END: break
            ch = chord_at(k); dur = 0.6 * SPB; n = int(dur * SR)
            shape = np.sin(np.linspace(0, np.pi, n)) ** 0.6
            m.add(supersaw([c + 12 for c in ch[1:]], dur, 4200, 7, 0.35) * shape, B(k), 0.4)
    beat = CUT
    while beat < END:  # sub bass following chords
        ch = chord_at(beat); n = int(SPB * 0.95 * SR); tt = np.arange(n) / SR
        m.add(np.sin(2 * np.pi * hz(ch[0] - 12) * tt) * env(n, 0.01, 0.1), B(beat), 0.32 if beat >= PHONE else 0.18)
        beat += 1
    for beat in range(PHONE, END):  # half-time groove: kick on 1, clap on 3, light hats
        if beat % 4 == PHONE % 4: m.add(kick(m), B(beat), 0.5)
        if beat % 4 == (PHONE + 2) % 4: m.add(clap(m), B(beat), 0.26)
        if beat % 4 == (PHONE + 3) % 4: m.add(kick(m, 0.8), B(beat + 0.5), 0.35)
        m.add(hat(m), B(beat + 0.5), 0.045, 0.3)
    k = 0
    while k < PHONE:  # intro: soft plucked chord arps (synth, not piano)
        ch = chord_at(k); n = int(0.3 * SR); tt = np.arange(n) / SR
        m.add(lp(saw(hz(ch[1 + int(k * 2) % 4] + 12), tt), 1800) * np.exp(-tt * 12), B(k), 0.08, 0.3 if int(k * 2) % 2 else -0.3)
        k += 0.5


# ------------------------------ C2: future bass, tweaked ------------------------------
def option_c2(m):
    option_c(m)
    # riser + snare build into the drop when the phone lands
    n = int(B(2) * SR); tt = np.arange(n) / SR
    ph = np.cumsum(np.geomspace(220, 880, n)) / SR
    up = lp(saw(1, ph) + saw(1.006, ph), 3500) * np.linspace(0, 1, n) ** 2.2
    m.add(up, B(PHONE - 2), 0.1)
    k = PHONE - 2.0
    while k < PHONE - 0.05:
        fr = (k - (PHONE - 2)) / 2
        nn = int(0.15 * SR); t2 = np.arange(nn) / SR
        m.add(bp(m.noise(nn), 1200, 7000) * np.exp(-t2 * 30), B(k), 0.06 + 0.12 * fr, 0.1)
        k += 0.5 if fr < 0.5 else 0.25 if fr < 0.75 else 0.125
    # big full chord hit on Arrived and the logo, so the payoff feels bigger
    for b, ch, g in ((ARRIVED, chord_at(ARRIVED), 0.16), (END, chord_at(END), 0.42)):
        dur = 1.6; n = int(dur * SR)
        hit = supersaw([c + 12 for c in ch[1:]] + [ch[1] + 24], dur, 3800 if b == ARRIVED else 5000, 7, 0.35) * np.exp(-np.arange(n) / SR * 2.2) * env(n, 0.03 if b == ARRIVED else 0.003, 0.4)
        m.add(hit, B(b), g)
    # a sparkle-free "lift" melody on the drop: a few long supersaw lead notes, mid register
    lead = [(PHONE, 76, 2), (PHONE + 2, 74, 1), (PHONE + 3, 72, 1), (TAP, 74, 2), (STATUS, 71, 1.5), (STATUS + 2, 74, 2), (ARRIVED, 76, 2.5), (VIEWS, 72, 2), (VIEWS + 2, 74, 2)]
    for b, note, ln in lead:
        dur = B(ln); n = int(dur * SR)
        m.add(supersaw([note], dur, 3000, 5, 0.25) * env(n, 0.02, 0.25) * 0.9, B(b), 0.16, 0.05)
    # hats a little quieter so the chords lead
def render(name, fn):
    m = Mix(); fn(m); sfx(m)
    mix = np.stack([m.L, m.R], 1)[: int(TOTAL * SR)]
    n = len(mix); f = np.ones(n); fo = int(1.6 * SR); f[-fo:] = np.linspace(1, 0, fo) ** 1.3; f[:int(0.04 * SR)] = np.linspace(0, 1, int(0.04 * SR))
    mix *= f[:, None]
    mix = np.tanh(mix * 1.6) / np.tanh(1.6)
    mix /= np.max(np.abs(mix)) / 0.89
    wavfile.write(f'soundtrack-opt-{name}.wav', SR, (mix * 32767).astype(np.int16))
    x = mix.mean(1); rms = [np.sqrt((x[int(s * SR):int((s + 1) * SR)] ** 2).mean()) for s in range(int(TOTAL))]
    print(name, 'per-second level:', ' '.join(f'{r:.2f}' for r in rms))

for name, fn in (('C4-futurebass', option_c2),):
    render(name, fn)
