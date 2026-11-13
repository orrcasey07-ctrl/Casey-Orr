export type AuthModalMode = 'login' | 'signup' | 'forgot' | 'update_password';

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const isDemoUserId = (userId?: string | null): boolean =>
  Boolean(userId && userId.startsWith('demo_'));

export const shouldUseLocalData = (isConfigured: boolean, userId?: string | null): boolean =>
  !isConfigured || isDemoUserId(userId);

export const isEmailNotConfirmedError = (msg?: string | null): boolean =>
  Boolean(msg && msg.toLowerCase().includes('email not confirmed'));

export const translateAuthError = (msg: string): string => {
  const lower = msg.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'Ungültige E-Mail-Adresse oder falsches Passwort.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Deine E-Mail-Adresse wurde noch nicht bestätigt. Bitte prüfe dein Postfach oder sende den Bestätigungslink erneut.';
  }
  if (lower.includes('user already registered')) {
    return 'Für diese E-Mail-Adresse existiert bereits ein Konto. Melde dich einfach an.';
  }
  if (lower.includes('password should be at least') || lower.includes('weak password')) {
    return 'Das Passwort muss mindestens 6 Zeichen lang sein.';
  }
  if (lower.includes('new password should be different')) {
    return 'Das neue Passwort muss sich vom bisherigen Passwort unterscheiden.';
  }
  if (lower.includes('unable to validate email address') || lower.includes('invalid email')) {
    return 'Bitte gib eine gültige E-Mail-Adresse ein.';
  }
  if (lower.includes('signup is disabled') || lower.includes('signups not allowed')) {
    return 'Die Registrierung ist vorübergehend deaktiviert. Nutze gerne den lokalen Test-Modus.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('email rate limit')) {
    return 'Zu viele Anfragen in kurzer Zeit. Bitte warte einen kurzen Moment und versuche es erneut.';
  }
  if (lower.includes('token has expired') || lower.includes('otp_expired') || lower.includes('invalid link')) {
    return 'Der Bestätigungs- oder Reset-Link ist abgelaufen. Bitte fordere einen neuen Link an.';
  }
  return msg;
};
