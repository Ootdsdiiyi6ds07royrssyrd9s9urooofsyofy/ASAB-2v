import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Gauge,
  LocateFixed,
  Mic,
  MicOff,
  Pause,
  Play,
  Radio,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Timer,
  TrendingUp,
  Volume2,
  VolumeX,
  Wind,
  Zap,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

type Point = { x: number; y: number };

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type FlightAudio = {
  context: AudioContext;
  master: GainNode;
  engine: GainNode;
  lowOscillator: OscillatorNode;
  highOscillator: OscillatorNode;
  airNoise: AudioBufferSourceNode;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const Sparkline: React.FC<{ values: number[]; color?: string; height?: number }> = ({ values, color = '#9a6a3a', height = 62 }) => {
  const points = values.map((value, index) => {
    const x = values.length === 1 ? 0 : (index / (values.length - 1)) * 100;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const y = max === min ? 50 : 92 - ((value - min) / (max - min)) * 76;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height }} aria-hidden="true">
      <defs>
        <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity=".28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,100 ${points} 100,100`} fill="url(#spark-fill)" stroke="none" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: string; detail: string; accent?: string }> = ({ icon: Icon, label, value, detail, accent = '#9a6a3a' }) => (
      <div className="ui-panel rounded-xl border border-[#32261b] bg-[#211810] p-3 shadow-lg shadow-black/10">
    <div className="flex items-center justify-between gap-2 text-[10px] text-[#b9a58c]">
      <span>{label}</span>
      <Icon className="h-4 w-4" style={{ color: accent }} />
    </div>
    <div className="mt-2 flex items-baseline gap-1">
      <span className="font-tech text-xl font-bold text-[#f6ecdd]">{value}</span>
      <span className="text-[10px] text-[#8c7860]">{detail}</span>
    </div>
  </div>
);

export const LiveFlightSimulationView: React.FC = () => {
  const { settings, updateSettings } = useSimulation();
  const isArabic = settings.language === 'ar';
  const [running, setRunning] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);
  const [altitudeTarget, setAltitudeTarget] = useState(2400);
  const [throttle, setThrottle] = useState(68);
  const [headingTarget, setHeadingTarget] = useState(184);
  const [elapsed, setElapsed] = useState(0);
  const [samples, setSamples] = useState<number[]>(() => Array.from({ length: 32 }, (_, i) => 188 + Math.sin(i / 3) * 12));
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [voiceMessage, setVoiceMessage] = useState('');
  const [audioArmed, setAudioArmed] = useState(false);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const audioRef = useRef<FlightAudio | null>(null);

  useEffect(() => {
    const speechWindow = window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
    setVoiceSupported(Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition));
    return () => {
      recognitionRef.current?.stop();
      const audio = audioRef.current;
      audio?.lowOscillator.stop();
      audio?.highOscillator.stop();
      audio?.airNoise.stop();
      audio?.context.close();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakResponse = (text: string) => {
    if (!settings.audioEnabled || !voiceReplyEnabled || !('speechSynthesis' in window)) return;
    const radioAudio = createAudio();
    if (radioAudio) radioAudio.master.gain.setTargetAtTime(0.16, radioAudio.context.currentTime, 0.03);
    playRadioChirp(0.16);
    window.speechSynthesis.cancel();
    const spokenText = isArabic ? `عَصَب — ${text}` : text;
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = isArabic ? 'ar-SA' : 'en-US';
    utterance.rate = isArabic ? 1.02 : 1.04;
    utterance.pitch = isArabic ? 0.78 : 0.86;
    utterance.volume = 0.96;
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((voice) => isArabic
      ? voice.lang.toLowerCase().startsWith('ar')
      : voice.lang.toLowerCase().startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.onend = () => playRadioChirp(0.14);
    window.speechSynthesis.speak(utterance);
  };

  const createAudio = () => {
    if (audioRef.current) {
      void audioRef.current.context.resume();
      return audioRef.current;
    }
    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.value = 0.16;
    master.connect(context.destination);

    const engine = context.createGain();
    engine.gain.value = 0;
    engine.connect(master);
    const lowOscillator = context.createOscillator();
    lowOscillator.type = 'sawtooth';
    lowOscillator.frequency.value = 62;
    lowOscillator.connect(engine);
    const highOscillator = context.createOscillator();
    highOscillator.type = 'triangle';
    highOscillator.frequency.value = 186;
    highOscillator.connect(engine);

    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const noiseData = buffer.getChannelData(0);
    for (let index = 0; index < noiseData.length; index += 1) noiseData[index] = (Math.random() * 2 - 1) * 0.35;
    const airNoise = context.createBufferSource();
    airNoise.buffer = buffer;
    airNoise.loop = true;
    const airFilter = context.createBiquadFilter();
    airFilter.type = 'bandpass';
    airFilter.frequency.value = 1250;
    airFilter.Q.value = 0.7;
    const airGain = context.createGain();
    airGain.gain.value = 0.035;
    airNoise.connect(airFilter).connect(airGain).connect(master);
    lowOscillator.start();
    highOscillator.start();
    airNoise.start();
    audioRef.current = { context, master, engine, lowOscillator, highOscillator, airNoise };
    return audioRef.current;
  };

  const armAudio = () => {
    const audio = createAudio();
    if (!audio) {
      setVoiceMessage(isArabic ? 'الصوت غير مدعوم في هذا المتصفح' : 'Audio is not supported by this browser');
      return null;
    }
    setAudioArmed(true);
    return audio;
  };

  const playRadioChirp = (duration = 0.18) => {
    const audio = audioRef.current;
    if (!audio) return;
    const { context, master } = audio;
    const now = context.currentTime;
    const radioGain = context.createGain();
    radioGain.gain.setValueAtTime(0.001, now);
    radioGain.gain.exponentialRampToValueAtTime(0.22, now + 0.025);
    radioGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    const carrier = context.createOscillator();
    carrier.type = 'square';
    carrier.frequency.setValueAtTime(920, now);
    carrier.frequency.exponentialRampToValueAtTime(640, now + duration);
    carrier.connect(radioGain).connect(master);
    carrier.start(now);
    carrier.stop(now + duration + 0.03);
    const staticBuffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate);
    const staticData = staticBuffer.getChannelData(0);
    for (let index = 0; index < staticData.length; index += 1) staticData[index] = (Math.random() * 2 - 1) * 0.18;
    const staticSource = context.createBufferSource();
    const staticGain = context.createGain();
    staticGain.gain.value = 0.12;
    staticSource.buffer = staticBuffer;
    staticSource.connect(staticGain).connect(master);
    staticSource.start(now);
  };

  const toggleAudio = () => {
    if (audioArmed) {
      const audio = audioRef.current;
      if (audio) audio.master.gain.setTargetAtTime(0, audio.context.currentTime, 0.04);
      setAudioArmed(false);
      updateSettings({ audioEnabled: false });
      return;
    }
    const audio = armAudio();
    if (audio) {
      audio.master.gain.setTargetAtTime(0.16, audio.context.currentTime, 0.04);
      updateSettings({ audioEnabled: true });
      playRadioChirp(0.24);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const targetGain = audioArmed && settings.audioEnabled && running ? 0.018 + throttle / 5000 : 0.0001;
    audio.engine.gain.setTargetAtTime(targetGain, audio.context.currentTime, 0.12);
    audio.lowOscillator.frequency.setTargetAtTime(48 + throttle * 0.32, audio.context.currentTime, 0.12);
    audio.highOscillator.frequency.setTargetAtTime(150 + throttle * 0.75, audio.context.currentTime, 0.12);
  }, [audioArmed, settings.audioEnabled, running, throttle]);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      setElapsed((value) => value + 0.5 * simSpeed);
      setSamples((values) => {
        const last = values[values.length - 1] ?? 188;
        const next = clamp(last + (Math.random() - 0.44) * 9 + (throttle - 65) * 0.05, 130, 260);
        return [...values.slice(-47), next];
      });
    }, 500);
    return () => window.clearInterval(interval);
  }, [running, simSpeed, throttle]);

  const telemetry = useMemo(() => {
    const phase = elapsed / 12;
    const altitude = clamp(altitudeTarget + Math.sin(phase) * 34 + Math.sin(phase / 2.7) * 12, 300, 6000);
    const airspeed = clamp(118 + throttle * 0.72 + Math.sin(phase / 1.9) * 4, 80, 230);
    const heading = (headingTarget + elapsed * 1.7 + Math.sin(phase) * 12 + 360) % 360;
    const verticalSpeed = Math.round(Math.cos(phase) * 3.8 + (altitudeTarget - altitude) * 0.06);
    const fuel = clamp(92 - elapsed * 0.018 - throttle * 0.002, 0, 100);
    const gLoad = 1 + Math.abs(Math.sin(phase * 1.4)) * 0.34;
    const link = clamp(98 - Math.abs(Math.sin(phase / 2)) * 7, 0, 100);
    const roll = Math.sin(phase / 1.7) * 3.1;
    const pitch = Math.cos(phase / 1.9) * 2.4;
    return { altitude, airspeed, heading, verticalSpeed, fuel, gLoad, link, roll, pitch };
  }, [altitudeTarget, elapsed, headingTarget, throttle]);

  const track = useMemo<Point[]>(() => Array.from({ length: 22 }, (_, index) => {
    const t = index / 21;
    return { x: 8 + t * 84, y: 50 - Math.sin(t * Math.PI * 2.2 + elapsed / 24) * 22 - t * 6 };
  }), [elapsed]);
  const trackPath = track.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
  const lastPoint = track[track.length - 1];

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setAltitudeTarget(2400);
    setThrottle(68);
    setHeadingTarget(184);
    setSamples(Array.from({ length: 32 }, (_, i) => 188 + Math.sin(i / 3) * 12));
  };

  const executeVoiceCommand = (rawCommand: string) => {
    const command = rawCommand.trim().toLowerCase();
    if (!command) return;
    playRadioChirp(0.12);
    setLastCommand(rawCommand.trim());
    const number = command.match(/\d+(?:\.\d+)?/)?.[0];
    const value = number ? Number(number) : undefined;
    let response = isArabic ? 'لم أفهم الأمر — جرّب: ارفع الارتفاع إلى 3000' : 'Command not recognized — try: climb to 3000';

    if (/تشغيل|استئناف|ابدأ|resume|start|take off/.test(command)) {
      setRunning(true);
      response = isArabic ? 'تم تشغيل المحاكاة' : 'Simulation resumed';
    } else if (/إيقاف|توقف|وقف|pause|stop|hold/.test(command)) {
      setRunning(false);
      response = isArabic ? 'تم إيقاف المحاكاة' : 'Simulation paused';
    } else if (/إعادة ضبط|اعادة ضبط|reset|restart/.test(command)) {
      reset();
      response = isArabic ? 'تمت إعادة ضبط الرحلة' : 'Flight reset complete';
    } else if (/ارتفاع|علو|altitude|climb|descend/.test(command)) {
      setAltitudeTarget((current) => value ? clamp(value, 500, 5000) : clamp(current + (/خفض|انزل|descend|lower/.test(command) ? -300 : 300), 500, 5000));
      response = isArabic ? `الارتفاع المستهدف: ${value ?? 'تعديل +300'} متر` : `Target altitude: ${value ?? 'increase by 300'} m`;
    } else if (/سرعة|خنق|دفع|speed|throttle/.test(command)) {
      setThrottle((current) => clamp(value ? (value > 100 ? 100 : value) : current + (/خفض|قلل|decrease|lower/.test(command) ? -10 : 10), 20, 100));
      response = isArabic ? `الدفع: ${value ?? 'زيادة 10'}%` : `Throttle: ${value ?? 'increase 10'}%`;
    } else if (/اتجاه|انعطف|heading|turn|يمين|right|يسار|left/.test(command)) {
      setHeadingTarget((current) => value ? ((value % 360) + 360) % 360 : (current + (/يسار|left/.test(command) ? -15 : 15) + 360) % 360);
      response = isArabic ? `تم توجيه الطائرة إلى ${value ?? 'اليمين'}` : `Heading adjusted ${value ? `to ${value}°` : 'right'}`;
    }
    setVoiceMessage(response);
    speakResponse(response);
  };

  const toggleVoiceControl = () => {
    if (!voiceSupported) {
      setVoiceMessage(isArabic ? 'المتصفح لا يدعم التعرف الصوتي' : 'Voice recognition is not supported by this browser');
      return;
    }
    if (voiceListening) {
      recognitionRef.current?.stop();
      setVoiceListening(false);
      return;
    }
    const speechWindow = window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    armAudio();
    playRadioChirp(0.24);
    const recognition = new SpeechRecognition();
    recognition.lang = isArabic ? 'ar-SA' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => executeVoiceCommand(event.results[0][0].transcript);
    recognition.onerror = () => {
      setVoiceListening(false);
      setVoiceMessage(isArabic ? 'تعذر التقاط الصوت — حاول مرة أخرى' : 'Could not capture voice — try again');
    };
    recognition.onend = () => setVoiceListening(false);
    recognitionRef.current = recognition;
    setVoiceMessage(isArabic ? 'استمع للأمر الآن...' : 'Listening for a command...');
    setVoiceListening(true);
    recognition.start();
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (event.code === 'Space') {
        event.preventDefault();
        setRunning((value) => !value);
      } else if (event.key.toLowerCase() === 'r') {
        reset();
      } else if (event.key.toLowerCase() === 'm') {
        toggleVoiceControl();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [voiceListening, voiceSupported, isArabic]);

  const quickCommands = [
    { label: isArabic ? 'تحليق مستقر' : 'Stable cruise', command: isArabic ? 'ارفع الارتفاع إلى 2400' : 'climb to 2400' },
    { label: isArabic ? 'تسارع' : 'Accelerate', command: isArabic ? 'زد السرعة إلى 82' : 'increase throttle to 82' },
    { label: isArabic ? 'انعطاف يمين' : 'Turn right', command: isArabic ? 'انعطف يميناً' : 'turn right' },
    { label: isArabic ? 'توقف آمن' : 'Safe hold', command: isArabic ? 'أوقف المحاكاة' : 'pause simulation' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-[#120e0a] p-3 font-mono text-xs text-[#f6ecdd] sm:p-5" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-[1600px] space-y-4">
        <header className="flex flex-col gap-3 rounded-2xl border border-[#32261b] bg-gradient-to-br from-[#2b1d14] to-[#231a12] p-4 shadow-xl shadow-black/20 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] text-[#9a6a3a]">
              <Radio className="h-4 w-4" /> {isArabic ? 'القياسات الحية / أيرولاب' : 'LIVE TELEMETRY / AEROLAB'}
            </div>
            <h1 className="text-xl font-bold text-[#f6ecdd]">{isArabic ? 'محاكاة الطيران الحية' : 'Live Flight Simulation'}</h1>
            <p className="mt-1 max-w-2xl font-sans text-[11px] leading-relaxed text-[#b9a58c]">
              {isArabic ? 'غرفة قيادة تفاعلية لمراقبة المسار، الأداء، والاتصال الجوي لحظة بلحظة.' : 'Interactive flight deck for live trajectory, performance and airborne link monitoring.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold ${running ? 'border-[#3ddc97]/40 bg-[#3ddc97]/10 text-[#3ddc97]' : 'border-[#d7a24b]/40 bg-[#d7a24b]/10 text-[#d7a24b]'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${running ? 'animate-pulse bg-[#3ddc97]' : 'bg-[#d7a24b]'}`} />
              {running ? (isArabic ? 'بث حي' : 'LIVE') : (isArabic ? 'متوقف' : 'PAUSED')}
            </span>
            <button onClick={() => setRunning((value) => !value)} className="ui-btn ui-btn-primary flex items-center gap-2 rounded-lg px-3 py-2 font-bold transition hover:brightness-110">
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? (isArabic ? 'إيقاف' : 'Pause') : (isArabic ? 'تشغيل' : 'Resume')}
            </button>
            <button onClick={reset} className="ui-btn ui-btn-icon rounded-lg p-2 transition hover:border-[#9a6a3a] hover:text-[#f6ecdd]" title={isArabic ? 'إعادة ضبط' : 'Reset'}>
              <RotateCcw className="h-4 w-4" />
            </button>
            <button onClick={() => setVoiceReplyEnabled((value) => !value)} className={`ui-btn flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[10px] font-bold transition ${voiceReplyEnabled ? 'border-[#9a6a3a]/50 bg-[#9a6a3a]/10 text-[#e2c18f]' : 'ui-btn-secondary text-[#8c7860]'}`} title={isArabic ? 'الرد الصوتي للأوامر' : 'Voice command replies'}>
              {voiceReplyEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span className="hidden sm:inline">{voiceReplyEnabled ? (isArabic ? 'الرد الصوتي مفعل' : 'VOICE REPLY ON') : (isArabic ? 'الرد الصوتي مكتوم' : 'VOICE REPLY OFF')}</span>
            </button>
            <button onClick={toggleAudio} className={`ui-btn flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[10px] font-bold transition ${audioArmed ? 'border-[#3ddc97]/40 bg-[#3ddc97]/10 text-[#3ddc97]' : 'ui-btn-secondary hover:border-[#9a6a3a] hover:text-[#f6ecdd]'}`} title={isArabic ? 'صوت المحرك والراديو' : 'Engine and radio audio'}>
              {audioArmed ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span className="hidden sm:inline">{audioArmed ? (isArabic ? 'الصوت مفعل' : 'AUDIO ON') : (isArabic ? 'تفعيل الصوت' : 'ENABLE AUDIO')}</span>
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-[#32261b] bg-[#1a140e] p-4 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className={`rounded-xl p-3 ${voiceListening ? 'bg-[#3ddc97]/15 text-[#3ddc97]' : 'bg-[#9a6a3a]/10 text-[#9a6a3a]'}`}>
                {voiceListening ? <Mic className="h-5 w-5 animate-pulse" /> : <MicOff className="h-5 w-5" />}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 font-bold">
                  {isArabic ? 'طيار ذكي — أوامر صوتية' : 'AI PILOT — VOICE COMMANDS'}
                  <span className="rounded-full border border-[#32261b] px-2 py-0.5 text-[9px] font-normal text-[#8c7860]">{voiceSupported ? (isArabic ? 'التعرف الصوتي جاهز' : 'WEB SPEECH API') : (isArabic ? 'غير متاح' : 'UNAVAILABLE')}</span>
                </div>
                <p className="mt-1 font-sans text-[10px] leading-relaxed text-[#b9a58c]">
                  {isArabic ? 'قل: «شغّل المحاكاة»، «ارفع الارتفاع إلى 3000»، «زد السرعة» أو «انعطف يميناً».' : 'Say: “resume simulation”, “climb to 3000”, “increase speed”, or “turn right”.'}
                </p>
              </div>
            </div>
            <button onClick={toggleVoiceControl} disabled={!voiceSupported} className={`ui-btn flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-bold transition ${voiceListening ? 'border border-[#3ddc97]/40 bg-[#3ddc97] text-[#102017] hover:brightness-110' : 'ui-btn-primary hover:brightness-110'} disabled:cursor-not-allowed disabled:opacity-40`}>
              {voiceListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              {voiceListening ? (isArabic ? 'استمع الآن...' : 'Listening...') : (isArabic ? 'ابدأ التحدث' : 'Start voice control')}
            </button>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-[#32261b] bg-[#211810] px-3 py-2 text-[10px] text-[#b9a58c]"><span className="text-[#8c7860]">{isArabic ? 'آخر أمر' : 'LAST COMMAND'}: </span><span className="text-[#f6ecdd]">{lastCommand || (isArabic ? 'بانتظار أمر صوتي' : 'Waiting for voice input')}</span></div>
            <div className="rounded-lg border border-[#32261b] bg-[#211810] px-3 py-2 text-[10px] text-[#9a6a3a]"><span className="text-[#8c7860]">{isArabic ? 'استجابة النظام' : 'SYSTEM RESPONSE'}: </span>{voiceMessage || (isArabic ? 'النظام جاهز للتوجيه' : 'System ready for guidance')}</div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#32261b] pt-3">
            <span className="me-1 text-[9px] font-bold tracking-wider text-[#8c7860]">{isArabic ? 'أوامر سريعة' : 'QUICK COMMANDS'}</span>
            {quickCommands.map((item) => (
              <button key={item.command} onClick={() => executeVoiceCommand(item.command)} className="ui-chip px-3 py-1.5 text-[10px] text-[#b9a58c] transition hover:text-[#f6ecdd]" title={item.command}>
                {item.label}
              </button>
            ))}
            <span className="ms-auto hidden text-[9px] text-[#8c7860] sm:inline">SPACE {isArabic ? 'تشغيل' : 'toggle'} · M {isArabic ? 'صوت' : 'voice'} · R {isArabic ? 'ضبط' : 'reset'}</span>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Gauge} label={isArabic ? 'الارتفاع' : 'الارتفاع'} value={Math.round(telemetry.altitude).toLocaleString()} detail="m AMSL" />
          <StatCard icon={TrendingUp} label={isArabic ? 'السرعة الجوية' : 'AIRالسرعة'} value={Math.round(telemetry.airspeed).toString()} detail="km/h" accent="#b5793f" />
          <StatCard icon={LocateFixed} label={isArabic ? 'الاتجاه' : 'الاتجاه'} value={Math.round(telemetry.heading).toString().padStart(3, '0')} detail="° HDG" accent="#d7a24b" />
          <StatCard icon={Timer} label={isArabic ? 'زمن المهمة' : 'MISSION TIME'} value={formatTime(elapsed)} detail="UTC+0" accent="#3ddc97" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,.8fr)]">
          <section className="overflow-hidden rounded-2xl border border-[#32261b] bg-[#1a140e] shadow-xl shadow-black/20">
            <div className="flex items-center justify-between border-b border-[#32261b] px-4 py-3">
              <div className="flex items-center gap-2 font-bold"><Activity className="h-4 w-4 text-[#9a6a3a]" /> {isArabic ? 'مؤشر وضعية الطائرة' : 'FLIGHT ATTITUDE DISPLAY'}</div>
              <span className="text-[10px] text-[#8c7860]">ASAB-V100 / EAGLE-01</span>
            </div>
            <div className="relative m-4 h-64 overflow-hidden rounded-xl border border-[#32261b] bg-[#0e0b08] sm:h-80">
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(216,185,138,.13) 1px, transparent 1px), linear-gradient(90deg, rgba(216,185,138,.13) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className="absolute h-[180%] w-[130%] -rotate-6 bg-gradient-to-b from-[#c69b6b] via-[#b5793f] to-[#f6ecdd] opacity-65" style={{ transform: `rotate(${telemetry.roll * 1.8 - 3}deg) translateY(${telemetry.pitch * 4}px)` }} />
                <div className="absolute top-1/2 h-px w-full bg-[#f6ecdd]/70" />
                <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#f6ecdd]/40" />
                <div className="absolute left-1/2 top-1/2 h-px w-36 -translate-x-1/2 bg-[#f6ecdd]" />
                <div className="absolute left-1/2 top-1/2 h-20 w-px -translate-y-1/2 bg-[#f6ecdd]" />
              </div>
              <div className="absolute left-4 top-4 space-y-1 text-[10px] text-[#f6ecdd]"><div>{isArabic ? 'الميلان' : 'ROLL'} <b>{(Math.sin(elapsed / 7) * 3.1).toFixed(1)}°</b></div><div>{isArabic ? 'الانحدار' : 'PITCH'} <b>{(Math.cos(elapsed / 8) * 2.4).toFixed(1)}°</b></div></div>
              <div className="absolute right-4 top-4 text-right text-[10px] text-[#9a6a3a]"><div>{isArabic ? 'مدير الطيران' : 'FLIGHT DIRECTOR'}</div><b className="text-[#3ddc97]">{isArabic ? 'مفعل / على المسار' : 'ON / TRACK'}</b></div>
              <div className="absolute bottom-4 left-4 text-[10px] text-[#b9a58c]">{isArabic ? 'رياح' : 'WIND'} 18 km/h · 274°</div>
              <div className="absolute bottom-4 right-4 text-right text-[10px] text-[#b9a58c]">{isArabic ? 'معدل التسلق' : 'V/S'} <b className="text-[#f6ecdd]">{telemetry.verticalSpeed > 0 ? '+' : ''}{telemetry.verticalSpeed} m/s</b></div>
            </div>
            <div className="grid grid-cols-3 gap-px border-t border-[#32261b] bg-[#32261b]">
              {[['ROLL', `${(Math.sin(elapsed / 7) * 3.1).toFixed(1)}°`], ['PITCH', `${(Math.cos(elapsed / 8) * 2.4).toFixed(1)}°`], ['G-LOAD', `${telemetry.gLoad.toFixed(2)} g`]].map(([label, value]) => <div key={label} className="bg-[#211810] p-3 text-center"><div className="text-[9px] text-[#8c7860]">{label}</div><div className="mt-1 font-tech font-bold text-[#9a6a3a]">{value}</div></div>)}
            </div>
          </section>

          <section className="rounded-2xl border border-[#32261b] bg-[#1a140e] p-4 shadow-xl shadow-black/20">
            <div className="mb-4 flex items-center gap-2 font-bold"><SlidersHorizontal className="h-4 w-4 text-[#9a6a3a]" /> {isArabic ? 'تحكم الرحلة' : 'FLIGHT CONTROLS'}</div>
            <div className="space-y-5">
              <label className="block"><div className="mb-2 flex justify-between text-[11px] text-[#b9a58c]"><span>{isArabic ? 'الارتفاع المستهدف' : 'TARGET الارتفاع'}</span><b className="text-[#f6ecdd]">{altitudeTarget.toLocaleString()} m</b></div><input type="range" min="500" max="5000" step="50" value={altitudeTarget} onChange={(event) => setAltitudeTarget(Number(event.target.value))} className="w-full accent-[#9a6a3a]" /></label>
              <label className="block"><div className="mb-2 flex justify-between text-[11px] text-[#b9a58c]"><span>{isArabic ? 'الخانق / الدفع' : 'THROTTLE'}</span><b className="text-[#f6ecdd]">{throttle}%</b></div><input type="range" min="20" max="100" value={throttle} onChange={(event) => setThrottle(Number(event.target.value))} className="w-full accent-[#b5793f]" /></label>
              <label className="block"><div className="mb-2 flex justify-between text-[11px] text-[#b9a58c]"><span>{isArabic ? 'سرعة المحاكاة' : 'SIMULATION RATE'}</span><b className="text-[#f6ecdd]">×{simSpeed}</b></div><input type="range" min="0.5" max="4" step="0.5" value={simSpeed} onChange={(event) => setSimSpeed(Number(event.target.value))} className="w-full accent-[#d7a24b]" /></label>
              <div className="grid grid-cols-2 gap-2 pt-2"><div className="rounded-lg bg-[#211810] p-3"><div className="text-[9px] text-[#8c7860]">{isArabic ? 'الوقود المتبقي' : 'FUEL REMAINING'}</div><div className="mt-1 text-lg font-bold text-[#3ddc97]">{telemetry.fuel.toFixed(1)}%</div><div className="mt-2 h-1 rounded-full bg-[#32261b]"><div className="h-full rounded-full bg-[#3ddc97]" style={{ width: `${telemetry.fuel}%` }} /></div></div><div className="rounded-lg bg-[#211810] p-3"><div className="text-[9px] text-[#8c7860]">{isArabic ? 'جودة الاتصال' : 'LINK QUALITY'}</div><div className="mt-1 text-lg font-bold text-[#9a6a3a]">{telemetry.link.toFixed(1)}%</div><div className="mt-2 h-1 rounded-full bg-[#32261b]"><div className="h-full rounded-full bg-[#9a6a3a]" style={{ width: `${telemetry.link}%` }} /></div></div></div>
              <div className="flex items-center gap-2 rounded-lg border border-[#3ddc97]/20 bg-[#3ddc97]/5 p-3 text-[10px] text-[#b9a58c]"><ShieldCheck className="h-4 w-4 shrink-0 text-[#3ddc97]" /> {isArabic ? 'المسار ضمن حدود السلامة — لا توجد إنذارات حرجة.' : 'Flight path within safety envelope — no critical alerts.'}</div>
            </div>
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-[#32261b] bg-[#1a140e] p-4 shadow-xl shadow-black/20"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 font-bold"><TrendingUp className="h-4 w-4 text-[#9a6a3a]" /> {isArabic ? 'السرعة الجوية — مباشر' : 'AIRالسرعة — LIVE'}</div><span className="text-[10px] text-[#9a6a3a]">{Math.round(telemetry.airspeed)} km/h</span></div><div className="rounded-lg bg-[#211810] p-2"><Sparkline values={samples} /></div><div className="mt-2 flex justify-between text-[9px] text-[#8c7860]"><span>-24 {isArabic ? 'ثانية' : 'sec'}</span><span>{isArabic ? 'الآن' : 'NOW'}</span></div></section>
          <section className="rounded-2xl border border-[#32261b] bg-[#1a140e] p-4 shadow-xl shadow-black/20"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 font-bold"><Wind className="h-4 w-4 text-[#b5793f]" /> {isArabic ? 'خريطة المسار الحية' : 'LIVE FLIGHT MAP'}</div><span className="text-[10px] text-[#b9a58c]">{Math.round(telemetry.heading).toString().padStart(3, '0')}°</span></div><div className="relative h-40 overflow-hidden rounded-lg border border-[#32261b] bg-[#211810]" style={{ backgroundImage: 'linear-gradient(rgba(216,185,138,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(216,185,138,.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full"><path d="M 4 78 C 18 64, 28 72, 40 52 S 62 24, 96 18" fill="none" stroke="#d8b98a" strokeOpacity=".16" strokeWidth="10" vectorEffect="non-scaling-stroke" /><path d={trackPath} fill="none" stroke="#b5793f" strokeDasharray="2 1" strokeWidth="1.8" vectorEffect="non-scaling-stroke" /><circle cx="8" cy="78" r="3" fill="#8fc46a" /><circle cx={lastPoint.x} cy={lastPoint.y} r="3.4" fill="#9a6a3a" stroke="#f6ecdd" strokeWidth=".8" /></svg><span className="absolute bottom-2 start-2 rounded bg-[#17130e]/85 px-1.5 py-0.5 text-[9px] text-[#b9a58c]">GCS-01</span><span className="absolute top-2 end-2 rounded bg-[#17130e]/85 px-1.5 py-0.5 text-[9px] text-[#b9a58c]">WP-04</span></div><div className="mt-2 flex justify-between text-[9px] text-[#8c7860]"><span>{isArabic ? 'نقطة الانطلاق / GCS-01' : 'ORIGIN / GCS-01'}</span><span className="text-[#3ddc97]">{isArabic ? 'الملاحة مثبتة' : 'NAV LOCKED'}</span></div></section>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#32261b] bg-[#1a140e] px-4 py-3 text-[10px] text-[#8c7860]"><span className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-[#d7a24b]" /> {isArabic ? 'تحديث القياسات كل 500 مللي ثانية' : 'Telemetry refresh: 500 ms'}</span><span>{isArabic ? 'خط العرض' : 'LAT'} 24.7136° N · {isArabic ? 'خط الطول' : 'LON'} 46.6753° E · ASAB-MESH-V3</span></footer>
      </div>
    </div>
  );
};
