// frontend/app/(auth)/otp/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api, { unwrap } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { AuthUser } from '@/store/auth.store';
import type { AxiosError } from 'axios';

const OTP_LENGTH = 6;
const OTP_TIMER_SECONDS = 5 * 60; // 5 minutes

function OtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const userId = params.get('userId') ?? '';

  const setAuth = useAuthStore((s) => s.setAuth);

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(OTP_TIMER_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Refs for each digit input so we can move focus programmatically
  const inputRefs = useRef<Array<HTMLInputElement | null>>(
    Array(OTP_LENGTH).fill(null),
  );

  // ─── Countdown timer ────────────────────────────────────────────────────

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const formatTime = (s: number): string => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // ─── Auto-submit when all 6 digits are entered ──────────────────────────

  const submitOtp = useCallback(
    async (code: string) => {
      if (!userId) {
        setError('Session expired. Please log in again.');
        return;
      }
      setIsVerifying(true);
      setError(null);

      try {
        const response = await api.post<{
          accessToken: string;
          refreshToken?: string;
          user: AuthUser;
        }>('/api/auth/otp/verify', { userId, code });
      const result = unwrap(response.data) as {
          accessToken: string;
          refreshToken?: string;
          user: AuthUser;
        };

        setAuth({
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });
        router.push('/dashboard');
      } catch (err) {
        const e = err as AxiosError<{ message: string }>;
        setError(e.response?.data?.message ?? 'Invalid or expired code. Try again.');
        // Clear digits on error so user can re-enter
        setDigits(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } finally {
        setIsVerifying(false);
      }
    },
    [userId, setAuth, router],
  );

  // ─── Input handlers ──────────────────────────────────────────────────────

  const handleChange = (index: number, value: string) => {
    // Only accept digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError(null);

    // Move focus forward on digit entry
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    if (next.every((d) => d !== '') && digit) {
      void submitOtp(next.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move focus back on backspace if current input is empty
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);
    // Focus the last filled input or the one after
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
    if (next.every((d) => d !== '')) {
      void submitOtp(next.join(''));
    }
  };

  // ─── Resend OTP ──────────────────────────────────────────────────────────

  const handleResend = async () => {
    if (!userId) return;
    setIsResending(true);
    setError(null);
    setResendMessage(null);

    try {
      await api.post('/api/auth/otp/send', { userId });
      setSecondsLeft(OTP_TIMER_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(''));
      setResendMessage('A new code has been sent to your email.');
      inputRefs.current[0]?.focus();
    } catch {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-blue-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 shadow-lg mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="text-sm text-gray-500 mt-1">
            We sent a 6-digit code to your email address
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Timer */}
          <div className="text-center mb-6">
            <span
              className={`text-2xl font-mono font-semibold tabular-nums ${
                secondsLeft <= 30 ? 'text-red-500' : 'text-gray-700'
              }`}
            >
              {formatTime(secondsLeft)}
            </span>
            <p className="text-xs text-gray-400 mt-1">remaining</p>
          </div>

          {/* Error / success messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 text-center">{error}</p>
            </div>
          )}
          {resendMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 text-center">{resendMessage}</p>
            </div>
          )}

          {/* 6 digit inputs */}
          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={isVerifying || secondsLeft <= 0}
                className={`w-11 h-14 text-center text-xl font-bold border-2 rounded-xl
                  outline-none transition-all duration-150
                  ${digit ? 'border-brand-500 bg-brand-50' : 'border-gray-300 bg-white'}
                  focus:border-brand-500 focus:ring-2 focus:ring-brand-200
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            ))}
          </div>

          {/* Verify button (manual submit fallback) */}
          <button
            type="button"
            onClick={() => void submitOtp(digits.join(''))}
            disabled={digits.some((d) => !d) || isVerifying || secondsLeft <= 0}
            className="btn-primary"
          >
            {isVerifying ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Verifying…
              </span>
            ) : (
              'Verify code'
            )}
          </button>

          {/* Resend button */}
          <div className="text-center mt-5">
            <p className="text-sm text-gray-500">
              Didn&apos;t receive the code?{' '}
              <button
                type="button"
                onClick={() => void handleResend()}
                disabled={isResending || secondsLeft > OTP_TIMER_SECONDS - 10}
                className="text-brand-600 hover:text-brand-700 font-medium
                           disabled:opacity-40 disabled:cursor-not-allowed
                           underline-offset-2 hover:underline transition-colors"
              >
                {isResending ? 'Sending…' : 'Resend code'}
              </button>
            </p>
          </div>

          {/* Expired state */}
          {secondsLeft <= 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700 text-center">
                Your code has expired. Please request a new one.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <OtpForm />
    </Suspense>
  );
}
