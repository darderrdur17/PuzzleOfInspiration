type ToneOptions = {
  duration?: number;
  frequency?: number;
  type?: OscillatorType;
  gain?: number;
};

const createContext = () => {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;
  return new AudioCtx();
};

let sharedCtx: AudioContext | null = null;

const playTone = ({ duration = 0.25, frequency = 440, type = "sine", gain = 0.15 }: ToneOptions) => {
  if (typeof window === "undefined") return;
  sharedCtx = sharedCtx ?? createContext();
  if (!sharedCtx) return;
  const ctx = sharedCtx;
  const oscillator = ctx.createOscillator();
  const amplifier = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  amplifier.gain.value = gain;

  oscillator.connect(amplifier);
  amplifier.connect(ctx.destination);

  const now = ctx.currentTime;
  oscillator.start(now);
  amplifier.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.stop(now + duration);
};

export const playSuccessTone = () => {
  playTone({ frequency: 720, type: "triangle", duration: 0.18, gain: 0.2 });
};

export const playErrorTone = () => {
  playTone({ frequency: 220, type: "sawtooth", duration: 0.3, gain: 0.25 });
};

export const playAlertTone = () => {
  playTone({ frequency: 520, type: "square", duration: 0.15, gain: 0.22 });
  setTimeout(() => playTone({ frequency: 620, type: "square", duration: 0.15, gain: 0.22 }), 160);
};

