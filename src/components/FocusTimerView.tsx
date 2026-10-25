import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Coffee,
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

  // Handle countdown interval
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
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

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
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
    setMode(newMode);
    setTimeLeft(MODE_CONFIG[newMode].durationMinutes * 60);
    setStatusMessage('');
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setTimeLeft(MODE_CONFIG[mode].durationMinutes * 60);
    setStatusMessage('');
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold rounded-full mb-3">
          <Clock className="w-3.5 h-3.5" />
          Pomodoro-Methode
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">
          Fokus- & Lerntimer
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Steigere deine Konzentration in 25-Minuten-Intervallen mit wissenschaftlich bewährten Lernpausen.
        </p>
      </div>

      {/* Main Timer Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-10 shadow-sm max-w-xl mx-auto">
        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl mb-8">
          {(['pomodoro', 'short_break', 'long_break'] as TimerMode[]).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  active
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {MODE_CONFIG[m].label}
              </button>
            );
          })}
        </div>

        {/* Circular Progress & Digits */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex flex-col items-center justify-center w-64 h-64 sm:w-72 sm:h-72 rounded-full border-8 border-slate-100 dark:border-slate-700/60 relative">
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
                className={`transition-all duration-1000 ${
                  mode === 'pomodoro'
                    ? 'stroke-blue-600 dark:stroke-blue-500'
                    : 'stroke-emerald-500'
                }`}
                strokeWidth="6"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <span className="text-5xl sm:text-6xl font-black text-slate-800 dark:text-white tracking-tight mb-2 font-mono">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {MODE_CONFIG[mode].description}
            </span>
          </div>
        </div>

        {/* Status Alert if finished */}
        {statusMessage && (
          <div className="mb-6 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {statusMessage}
          </div>
        )}

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Zurücksetzen"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold text-base shadow-lg transition-all ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
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
            className={`p-3.5 rounded-2xl border transition-colors ${
              soundEnabled
                ? 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                : 'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-500'
            }`}
            title={soundEnabled ? 'Ton ausschalten' : 'Ton einschalten'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        {/* Daily Stats Summary */}
        <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
          <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40">
            <div className="text-xl font-bold text-slate-800 dark:text-white flex items-center justify-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              {completedCount}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Einheiten dieser Sitzung
            </div>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40">
            <div className="text-xl font-bold text-slate-800 dark:text-white flex items-center justify-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              {totalMinutesToday} min
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Heute fokussiert gelernt
            </div>
          </div>
        </div>
      </div>

      {/* Student Study Tips Card */}
      <div className="mt-8 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-5 max-w-xl mx-auto flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
          <strong>Lerntipp:</strong> Die Pomodoro-Technik hilft gegen Aufschieberitis (Prokrastination). Nach 4 Intervallen empfiehlt sich eine 15-minütige lange Pause, um neue Synapsen zu festigen.
        </div>
      </div>
    </div>
  );
};
