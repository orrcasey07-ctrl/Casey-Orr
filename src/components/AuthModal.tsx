import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { signIn, signUp, resetPassword, isConfigured } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync mode whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message === 'Invalid login credentials' 
            ? 'Ungültige E-Mail-Adresse oder falsches Passwort.' 
            : error.message);
        } else {
          onClose();
        }
      } else if (mode === 'signup') {
        if (password.length < 6) {
          setErrorMsg('Das Passwort muss mindestens 6 Zeichen lang sein.');
          setLoading(false);
          return;
        }
        const { error, message } = await signUp(email, password, displayName);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg(message || 'Registrierung erfolgreich!');
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Link zum Zurücksetzen des Passworts wurde per E-Mail versendet.');
        }
      }
    } catch {
      setErrorMsg('Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md bg-[#111412] border border-[#292F2B] rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#A4AAA5] hover:text-white hover:bg-[#171B18] rounded-xl transition-colors cursor-pointer"
          aria-label="Schließen"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <span className="text-[10px] font-mono tracking-widest text-[#C5F82A] uppercase block mb-1">
            NOTENPILOT CLOUD-ZUGANG
          </span>
          <h3 id="auth-modal-title" className="text-2xl font-bold tracking-tight text-white">
            {mode === 'login' && 'Schüler-Login'}
            {mode === 'signup' && 'Kostenlos registrieren'}
            {mode === 'forgot' && 'Passwort zurücksetzen'}
          </h3>
          <p className="text-xs text-[#A4AAA5] mt-1.5 leading-relaxed">
            {mode === 'login' && 'Melde dich an, um deine Notenberechnungen, Lernnotizen und Klausuren sicher in der Cloud zu verwalten.'}
            {mode === 'signup' && 'Erstelle dein persönliches Schülerkonto – 100% kostenlos und DSGVO-konform.'}
            {mode === 'forgot' && 'Gib deine registrierte E-Mail-Adresse ein, um einen Reset-Link zu erhalten.'}
          </p>
        </div>

        {/* Demo banner if Supabase is in local demo fallback */}
        {!isConfigured && (
          <div className="mb-5 p-3 rounded-xl bg-amber-950/30 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Demo-Modus aktiv:</strong> Deine Daten werden lokal in deinem Browser gesichert.
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#C5F82A] shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-mono font-semibold text-[#A4AAA5] uppercase tracking-wider mb-1.5">
                Dein Name / Anzeigename
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[#A4AAA5]" />
                <input
                  type="text"
                  required
                  placeholder="z. B. Sophie oder Alex"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#171B18] border border-[#292F2B] text-white rounded-xl focus:outline-none focus:border-[#C5F82A] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-semibold text-[#A4AAA5] uppercase tracking-wider mb-1.5">
              E-Mail-Adresse
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#A4AAA5]" />
              <input
                type="email"
                required
                placeholder="name@schule.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#171B18] border border-[#292F2B] text-white rounded-xl focus:outline-none focus:border-[#C5F82A] transition-colors"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono font-semibold text-[#A4AAA5] uppercase tracking-wider">
                  Passwort
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs text-[#C5F82A] hover:underline"
                  >
                    Passwort vergessen?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#A4AAA5]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#171B18] border border-[#292F2B] text-white rounded-xl focus:outline-none focus:border-[#C5F82A] transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-[#C5F82A] hover:bg-white text-[#090B0A] text-sm font-bold rounded-xl shadow-lg shadow-[#C5F82A]/20 transition-all duration-300 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-[#090B0A] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Jetzt anmelden'}
                  {mode === 'signup' && 'Konto kostenlos anlegen'}
                  {mode === 'forgot' && 'Reset-Link anfordern'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Mode Switchers */}
        <div className="mt-6 pt-5 border-t border-[#292F2B] text-center text-xs text-[#A4AAA5]">
          {mode === 'login' && (
            <p>
              Noch kein Schülerkonto?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-[#C5F82A] font-semibold hover:underline cursor-pointer"
              >
                Hier kostenlos registrieren
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p>
              Bereits registriert?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-[#C5F82A] font-semibold hover:underline cursor-pointer"
              >
                Zum Login
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-[#C5F82A] font-semibold hover:underline cursor-pointer"
            >
              Zurück zum Login
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#A4AAA5]/60 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C5F82A]" />
          <span>Verschlüsselt mit Supabase Row Level Security (DSGVO)</span>
        </div>
      </div>
    </div>
  );
};
