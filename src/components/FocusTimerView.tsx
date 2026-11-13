import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume2,
  VolumeX,
  Flame,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  StudySession,
  getStudySessions,
  logStudySession,
} from '../lib/studentData';
import { useAuth } from '../context/AuthContext';

type TimerMode = 'pomodoro' | 'short_break' | 'long_break';

const MODE_CONFIG: Record<TimerMode, { label: string; durationMinutes: number; description: string }> = {
  pomodoro: {
    label: 'Fokuszeit',
    durationMinutes: 25,
    description: 'Konzentriertes Lernen ohne Benachrichtigungen',
  },
  short_break: {
    label: 'Kurze Pause',
    durationMinutes: 5,
    description: 'Aufstehen, Wasser trinken, Augen entspannen',
  },
  long_break: {
    label: 'Lange Pause',
    durationMinutes: 15,
    description: 'Frische Luft schnappen oder einen Snack genießen',
  },
};

export const FocusTimerView: React.FC = () => {
  const { user } = useAuth();

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_CONFIG.pomodoro.durationMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const targetEndTimeRef = useRef<number | null>(null);

  // Play gentle two-tone chime using Web Audio API
  const playCompletionChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Gentle C major chime: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz)
      playTone(523.25, 0, 0.4);
      playTone(659.25, 0.25, 0.4);
      playTone(783.99, 0.5, 0.8);
    } catch (e) {
      console.warn('Audio chime could not be initialized:', e);
    }
  }, [soundEnabled]);

  const loadSessions = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getStudySessions(user.id);
      setSessions(data);
    } catch (err) {
      console.error('Fehler beim Laden der Lerneinheiten:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user, loadSessions]);

  // Handle countdown interval with absolute timestamp to eliminate background tab drift
  useEffect(() => {
    if (isRunning) {
      if (!targetEndTimeRef.current) {
        targetEndTimeRef.current = Date.now() + timeLeft * 1000;
      }

      timerRef.current = setInterval(() => {
        if (!targetEndTimeRef.current) return;
        const diffMs = targetEndTimeRef.current - Date.now();
        const remaining = Math.max(0, Math.round(diffMs / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(timerRef.current!);
          setIsRunning(false);
          targetEndTimeRef.current = null;
          playCompletionChime();

          // When focus session completes
          if (mode === 'pomodoro') {
            setCompletedCount((c) => c + 1);
            setStatusMessage('Fokuseinheit abgeschlossen! Gönn dir eine kurze Pause.');
            if (user) {
              logStudySession(user.id, MODE_CONFIG.pomodoro.durationMinutes, 'pomodoro').then(() => {
                loadSessions();
              });
            }
          } else {
            setStatusMessage('Pause beendet! Bereit für die nächste Runde?');
          }
        }
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, user, playCompletionChime, loadSessions]);

  const switchMode = (newMode: TimerMode) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    targetEndTimeRef.current = null;
    setMode(newMode);
    setTimeLeft(MODE_CONFIG[newMode].durationMinutes * 60);
    setStatusMessage('');
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    targetEndTimeRef.current = null;
    setTimeLeft(MODE_CONFIG[mode].durationMinutes * 60);
    setStatusMessage('');
  };

  const handleToggleRunning = () => {
    if (isRunning) {
      setIsRunning(false);
      targetEndTimeRef.current = null;
    } else {
      targetEndTimeRef.current = Date.now() + timeLeft * 1000;
      setIsRunning(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = MODE_CONFIG[mode].durationMinutes * 60;
  const progressPercent = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);

  // Total learned minutes today
  const todaySessions = sessions.filter((s) => {
    const d = new Date(s.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const totalMinutesToday = todaySessions.reduce((acc, s) => acc + s.duration_minutes, 0);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8 text-white">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#171B18] border border-[#292F2B] text-[#C5F82A] text-xs font-mono font-semibold rounded-full mb-3">
          <Clock className="w-3.5 h-3.5" />
          Pomodoro-Methode
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2 tracking-tight">
          Fokus- & Lerntimer
        </h1>
        <p className="text-xs sm:text-sm text-[#A4AAA5] leading-relaxed">
          Steigere deine Konzentration in 25-Minuten-Intervallen mit wissenschaftlich bewährten Lernpausen.
        </p>
      </div>

      {/* Main Timer Card */}
      <div className="bg-[#111412] rounded-3xl border border-[#292F2B] p-4 sm:p-10 shadow-2xl max-w-xl mx-auto relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[radial-gradient(circle,rgba(197,248,42,0.04),transparent_70%)] pointer-events-none" />

        {/* Mode Selector Tabs */}
        <div className="flex bg-[#171B18] p-1 sm:p-1.5 rounded-2xl mb-8 border border-[#292F2B] relative z-10 gap-1">
          {(['pomodoro', 'short_break', 'long_break'] as TimerMode[]).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 sm:py-2.5 text-[11px] sm:text-sm font-bold rounded-xl transition-all cursor-pointer truncate ${
                  active
                    ? 'bg-[#C5F82A] text-[#090B0A] shadow-md'
                    : 'text-[#A4AAA5] hover:text-white'
                }`}
              >
                {MODE_CONFIG[m].label}
              </button>
            );
          })}
        </div>

        {/* Circular Progress & Digits */}
        <div className="text-center mb-8 relative z-10 flex justify-center">
          <div className="inline-flex flex-col items-center justify-center w-52 h-52 sm:w-72 sm:h-72 rounded-full border-8 border-[#171B18] relative shadow-inner">
            {/* SVG Ring Progress */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-transparent"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-[#C5F82A] transition-all duration-500"
                strokeWidth="6"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <span className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-1 sm:mb-2 font-mono tabular-nums">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[11px] sm:text-xs text-[#A4AAA5] px-4 truncate max-w-[85%]">
              {MODE_CONFIG[mode].description}
            </span>
          </div>
        </div>

        {/* Status Alert if finished */}
        {statusMessage && (
          <div className="mb-6 p-3.5 bg-[#171B18] border border-[#C5F82A]/30 text-[#C5F82A] rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {statusMessage}
          </div>
        )}

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-4 relative z-10">
          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl border border-[#292F2B] bg-[#171B18] text-[#A4AAA5] hover:text-white hover:bg-[#202521] transition-colors cursor-pointer"
            title="Zurücksetzen"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleToggleRunning}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-base shadow-xl transition-all cursor-pointer ${
              isRunning
                ? 'bg-[#171B18] hover:bg-[#202521] text-amber-400 border border-amber-400/40 shadow-amber-400/10'
                : 'bg-[#C5F82A] hover:bg-white text-[#090B0A] shadow-[#C5F82A]/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                {timeLeft === totalDuration ? 'Starten' : 'Fortsetzen'}
              </>
            )}
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3.5 rounded-2xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'border-[#292F2B] bg-[#171B18] text-[#A4AAA5] hover:text-white hover:bg-[#202521]'
                : 'border-red-500/30 bg-red-500/10 text-red-400'
            }`}
            title={soundEnabled ? 'Ton ausschalten' : 'Ton einschalten'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        {/* Daily Stats Summary */}
        <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-[#292F2B] relative z-10">
          <div className="text-center p-3.5 rounded-xl bg-[#171B18] border border-[#292F2B]">
            <div className="text-xl font-black text-white flex items-center justify-center gap-1.5 font-mono">
              <Flame className="w-4 h-4 text-[#C5F82A]" />
              {completedCount}
            </div>
            <div className="text-[11px] text-[#A4AAA5] mt-0.5">
              Einheiten dieser Sitzung
            </div>
          </div>
          <div className="text-center p-3.5 rounded-xl bg-[#171B18] border border-[#292F2B]">
            <div className="text-xl font-black text-white flex items-center justify-center gap-1.5 font-mono">
              <Clock className="w-4 h-4 text-[#C5F82A]" />
              {totalMinutesToday} Min.
            </div>
            <div className="text-[11px] text-[#A4AAA5] mt-0.5">
              Heute fokussiert gelernt
            </div>
          </div>
        </div>
      </div>

      {/* Student Study Tips Card */}
      <div className="mt-8 bg-[#111412] border border-[#292F2B] rounded-2xl p-5 max-w-xl mx-auto flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#C5F82A] shrink-0 mt-0.5" />
        <div className="text-xs text-[#A4AAA5] leading-relaxed">
          <strong className="text-white">Lerntipp:</strong> Die Pomodoro-Technik hilft gegen Aufschieberitis (Prokrastination). Nach 4 Intervallen empfiehlt sich eine 15-minütige lange Pause, um neue Synapsen zu festigen.
        </div>
      </div>
    </div>
  );
};
