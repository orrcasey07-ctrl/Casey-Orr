import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  AuthModalMode,
  isEmailNotConfirmedError,
  normalizeEmail,
  translateAuthError,
} from '../lib/authUtils';
import {
  X,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthModalMode;
  onAuthSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onAuthSuccess,
}) => {
  const {
    signIn,
    signUp,
    resendConfirmation,
    resetPassword,
    updatePassword,
    clearPasswordRecovery,
    enterDemoMode,
    isConfigured,
  } = useAuth();

  const [mode, setMode] = useState<AuthModalMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string | null>(null);
  const [showResendAction, setShowResendAction] = useState(false);

  // Sync mode whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
      setPendingConfirmationEmail(null);
      setShowResendAction(false);
      setShowPassword(false);
      setConfirmPassword('');
    }
  }, [isOpen, initialMode]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mode === 'update_password') clearPasswordRecovery();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, mode, clearPasswordRecovery]);

  if (!isOpen) return null;

  const switchMode = (nextMode: AuthModalMode) => {
    setMode(nextMode);
    setErrorMsg(null);
    setSuccessMsg(null);
    setPendingConfirmationEmail(null);
    setShowResendAction(false);
  };

  const handleClose = () => {
    if (mode === 'update_password') {
      clearPasswordRecovery();
    }
    onClose();
  };

  const handleQuickDemoAccess = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await enterDemoMode();
      onAuthSuccess?.();
      onClose();
    } catch {
      setErrorMsg('Der lokale Test-Modus konnte nicht gestartet werden.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async (targetEmail: string) => {
    const cleaned = normalizeEmail(targetEmail);
    if (!cleaned) {
      setErrorMsg('Bitte gib zuerst deine E-Mail-Adresse ein.');
      return;
    }
    setResending(true);
    setErrorMsg(null);
    try {
      const { error } = await resendConfirmation(cleaned);
      if (error) {
        setErrorMsg(translateAuthError(error.message));
      } else {
        setSuccessMsg(
          `Bestätigungs-E-Mail erneut an ${cleaned} gesendet. Bitte prüfe auch deinen Spam-Ordner.`
        );
      }
    } catch {
      setErrorMsg('Bestätigungs-E-Mail konnte nicht gesendet werden.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowResendAction(false);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(translateAuthError(error.message));
          if (isEmailNotConfirmedError(error.message)) {
            setShowResendAction(true);
          }
        } else {
          onAuthSuccess?.();
          onClose();
        }
      } else if (mode === 'signup') {
        if (password.length < 6) {
          setErrorMsg('Das Passwort muss mindestens 6 Zeichen lang sein.');
          setLoading(false);
          return;
        }
        const { error, message, needsEmailConfirmation } = await signUp(
          email,
          password,
          displayName
        );
        if (error) {
          setErrorMsg(translateAuthError(error.message));
        } else if (needsEmailConfirmation) {
          setPendingConfirmationEmail(normalizeEmail(email));
          setSuccessMsg(
            message ||
              'Konto erstellt! Bitte bestätige den Link in deiner E-Mail, um dein Cloud-Konto zu aktivieren.'
          );
        } else {
          onAuthSuccess?.();
          onClose();
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setErrorMsg(translateAuthError(error.message));
        } else {
          setSuccessMsg(
            'Link zum Zurücksetzen des Passworts wurde per E-Mail versendet. Bitte prüfe dein Postfach.'
          );
        }
      } else if (mode === 'update_password') {
        if (password.length < 6) {
          setErrorMsg('Das neue Passwort muss mindestens 6 Zeichen lang sein.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Die beiden Passwörter stimmen nicht überein.');
          setLoading(false);
          return;
        }
        const { error } = await updatePassword(password);
        if (error) {
          setErrorMsg(translateAuthError(error.message));
        } else {
          onAuthSuccess?.();
          onClose();
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md bg-[#111412] border border-[#292F2B] rounded-3xl p-6 sm:p-8 shadow-2xl text-white my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 text-[#A4AAA5] hover:text-white hover:bg-[#171B18] rounded-xl transition-colors cursor-pointer"
          aria-label="Anmeldefenster schließen"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 pr-8">
          <span className="text-[10px] font-mono tracking-widest text-[#C5F82A] uppercase block mb-1">
            NOTENPILOT SCHÜLER-ZUGANG
          </span>
          <h3 id="auth-modal-title" className="text-2xl font-bold tracking-tight text-white">
            {mode === 'login' && 'Schüler-Login'}
            {mode === 'signup' && 'Kostenlos registrieren'}
            {mode === 'forgot' && 'Passwort zurücksetzen'}
            {mode === 'update_password' && 'Neues Passwort festlegen'}
          </h3>
          <p className="text-xs text-[#A4AAA5] mt-1.5 leading-relaxed">
            {mode === 'login' &&
              'Melde dich an, um auf dein Dashboard, deine Lernnotizen, Fächer und Klausuren zuzugreifen.'}
            {mode === 'signup' &&
              'Erstelle dein persönliches Schülerkonto – 100 % kostenlos und DSGVO-konform.'}
            {mode === 'forgot' &&
              'Gib deine registrierte E-Mail-Adresse ein, um einen Reset-Link zu erhalten.'}
            {mode === 'update_password' &&
              'Vergib jetzt ein neues Passwort (mindestens 6 Zeichen) für deinen Zugang.'}
          </p>
        </div>

        {/* Fast Switcher Tabs for Login / Signup */}
        {(mode === 'login' || mode === 'signup') && !pendingConfirmationEmail && (
          <div
            className="grid grid-cols-2 gap-1.5 p-1 mb-5 rounded-xl bg-[#090B0A] border border-[#292F2B]"
            role="tablist"
            aria-label="Zugangsart wählen"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => switchMode('login')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#171B18] text-white border border-[#292F2B] shadow-sm'
                  : 'text-[#A4AAA5] hover:text-white'
              }`}
            >
              Anmelden
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              onClick={() => switchMode('signup')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#171B18] text-white border border-[#292F2B] shadow-sm'
                  : 'text-[#A4AAA5] hover:text-white'
              }`}
            >
              Registrieren
            </button>
          </div>
        )}

        {/* Demo banner if Supabase is not configured */}
        {!isConfigured && (
          <div className="mb-4 p-3 rounded-xl bg-amber-950/30 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Lokaler Modus:</strong> Deine Daten werden sicher lokal in deinem Browser gespeichert.
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-200 space-y-2.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
            {showResendAction && email.trim() && (
              <button
                type="button"
                disabled={resending}
                onClick={() => handleResendConfirmation(email)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#C5F82A] hover:underline cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>Bestätigungs-E-Mail erneut senden</span>
              </button>
            )}
          </div>
        )}

        {/* Success / Pending Confirmation state */}
        {pendingConfirmationEmail ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-950/35 border border-emerald-800/70 text-xs text-emerald-100 space-y-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#C5F82A] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-white text-sm">Fast geschafft – E-Mail bestätigen</div>
                  <p className="leading-relaxed text-emerald-100/90">
                    {successMsg}
                  </p>
                  <p className="text-[11px] text-[#A4AAA5] pt-1">
                    Tipp: Schau bitte auch in deinem Spam- oder Junk-Ordner nach.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                disabled={resending}
                onClick={() => handleResendConfirmation(pendingConfirmationEmail)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#171B18] hover:bg-[#202521] border border-[#292F2B] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#C5F82A] ${resending ? 'animate-spin' : ''}`} />
                <span>Bestätigungs-E-Mail erneut senden</span>
              </button>

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#C5F82A] hover:bg-white text-[#090B0A] text-xs font-bold transition-colors cursor-pointer"
              >
                Nach Bestätigung: Jetzt anmelden
              </button>
            </div>
          </div>
        ) : (
          <>
            {successMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-xs text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C5F82A] shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label
                    htmlFor="auth-display-name"
                    className="block text-xs font-mono font-semibold text-[#A4AAA5] uppercase tracking-wider mb-1.5"
                  >
                    Dein Name / Anzeigename
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-[#A4AAA5]" />
                    <input
                      id="auth-display-name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="z. B. Sophie oder Alex"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#171B18] border border-[#292F2B] text-white rounded-xl focus:outline-none focus:border-[#C5F82A] transition-colors"
                    />
                  </div>
                </div>
              )}

              {mode !== 'update_password' && (
                <div>
                  <label
                    htmlFor="auth-email"
                    className="block text-xs font-mono font-semibold text-[#A4AAA5] uppercase tracking-wider mb-1.5"
                  >
                    E-Mail-Adresse
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#A4AAA5]" />
                    <input
                      id="auth-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="name@schule.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#171B18] border border-[#292F2B] text-white rounded-xl focus:outline-none focus:border-[#C5F82A] transition-colors"
                    />
                  </div>
                </div>
              )}

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="auth-password"
                      className="block text-xs font-mono font-semibold text-[#A4AAA5] uppercase tracking-wider"
                    >
                      {mode === 'update_password' ? 'Neues Passwort' : 'Passwort'}
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-xs text-[#C5F82A] hover:underline cursor-pointer"
                      >
                        Passwort vergessen?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#A4AAA5]" />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete={
                        mode === 'login' ? 'current-password' : 'new-password'
                      }
                      placeholder="Mindestens 6 Zeichen"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-2.5 text-sm bg-[#171B18] border border-[#292F2B] text-white rounded-xl focus:outline-none focus:border-[#C5F82A] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                      className="absolute right-3 top-2.5 p-1 text-[#A4AAA5] hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'update_password' && (
                <div>
                  <label
                    htmlFor="auth-confirm-password"
                    className="block text-xs font-mono font-semibold text-[#A4AAA5] uppercase tracking-wider mb-1.5"
                  >
                    Neues Passwort bestätigen
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#A4AAA5]" />
                    <input
                      id="auth-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Passwort wiederholen"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      {mode === 'forgot' && 'Link zum Zurücksetzen anfordern'}
                      {mode === 'update_password' && 'Neues Passwort speichern'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* Frictionless 1-Click Local Student Access */}
        {mode !== 'update_password' && (
          <div className="mt-5 pt-4 border-t border-[#292F2B] space-y-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={handleQuickDemoAccess}
              className="w-full py-2.5 px-4 rounded-xl bg-[#171B18] hover:bg-[#1E231F] border border-[#292F2B] hover:border-[#C5F82A]/50 text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5F82A]" />
              <span>Sofort ohne E-Mail testen (Lokaler Schüler-Modus)</span>
            </button>
            <p className="text-[11px] text-center text-[#A4AAA5]/75">
              Ideal zum direkten Ausprobieren – speichert deine Daten sofort lokal im Browser.
            </p>
          </div>
        )}

        {/* Back to login link for forgot password */}
        {mode === 'forgot' && (
          <div className="mt-4 pt-4 border-t border-[#292F2B] text-center text-xs text-[#A4AAA5]">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-[#C5F82A] font-semibold hover:underline cursor-pointer"
            >
              Zurück zur Anmeldung
            </button>
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#A4AAA5]/60 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C5F82A]" />
          <span>Verschlüsselt mit Supabase Row Level Security (DSGVO)</span>
        </div>
      </div>
    </div>
  );
};
