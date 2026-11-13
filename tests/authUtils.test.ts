import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeEmail,
  isDemoUserId,
  shouldUseLocalData,
  isEmailNotConfirmedError,
  translateAuthError,
} from '../src/lib/authUtils';

test('normalizeEmail trims surrounding spaces and lowercases', () => {
  assert.equal(normalizeEmail('  Max.Mustermann@Schule.DE  '), 'max.mustermann@schule.de');
  assert.equal(normalizeEmail(''), '');
});

test('isDemoUserId and shouldUseLocalData identify local demo sessions cleanly', () => {
  assert.equal(isDemoUserId('demo_schueler'), true);
  assert.equal(isDemoUserId('demo_abc123'), true);
  assert.equal(isDemoUserId('550e8400-e29b-41d4-a716-446655440000'), false);
  assert.equal(isDemoUserId(null), false);

  assert.equal(shouldUseLocalData(false, 'any-user'), true);
  assert.equal(shouldUseLocalData(true, 'demo_schueler'), true);
  assert.equal(shouldUseLocalData(true, '550e8400-e29b-41d4-a716-446655440000'), false);
});

test('isEmailNotConfirmedError detects Supabase confirmation errors', () => {
  assert.equal(isEmailNotConfirmedError('Email not confirmed'), true);
  assert.equal(isEmailNotConfirmedError('Invalid login credentials'), false);
  assert.equal(isEmailNotConfirmedError(null), false);
});

test('translateAuthError returns natural German student messages', () => {
  assert.match(translateAuthError('Invalid login credentials'), /Ungültige E-Mail-Adresse/);
  assert.match(translateAuthError('Email not confirmed'), /noch nicht bestätigt/);
  assert.match(translateAuthError('User already registered'), /existiert bereits ein Konto/);
  assert.match(translateAuthError('Password should be at least 6 characters'), /mindestens 6 Zeichen/);
  assert.match(translateAuthError('For security purposes, you can only request this after 40 seconds (rate limit)'), /Zu viele Anfragen/);
});
