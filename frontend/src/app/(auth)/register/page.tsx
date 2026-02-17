'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useRegisterMutation, useVerifyOtpMutation } from '@/store/api/authApi';
import { useAuth, getRoleRedirect } from '@/hooks/useAuth';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginSuccess } = useAuth();
  const [registerApi, { isLoading: regLoading }] = useRegisterMutation();
  const [verifyOtp, { isLoading: otpLoading }] = useVerifyOtpMutation();

  const defaultRole = searchParams.get('role') || 'user';

  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    role: defaultRole,
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await registerApi(form).unwrap();
      setStep('otp');
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string; errors?: Record<string, string[]> } };
      if (apiErr?.data?.errors) {
        const firstErr = Object.values(apiErr.data.errors)[0]?.[0];
        setError(firstErr || apiErr?.data?.message || 'Registration failed.');
      } else {
        setError(apiErr?.data?.message || 'Registration failed.');
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await verifyOtp({ phone: form.phone, code: otp, purpose: 'registration' }).unwrap();
      if (result.data) {
        loginSuccess(result.data.user, {
          access_token: result.data.access_token,
          refresh_token: result.data.refresh_token,
        });
        router.push(getRoleRedirect(result.data.user.role));
      }
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      setError(apiErr?.data?.message || 'Invalid OTP.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-sm p-8 border border-border">
        <Link href="/" className="flex items-center justify-center gap-2 mb-10">
          <Image src="/images/logo-cropped.png" alt="AncerLarins" width={40} height={40} className="h-10 w-auto" />
          <span className="text-2xl font-bold text-accent-dark">Ancer</span>
          <span className="text-2xl font-bold text-text-primary">Larins</span>
        </Link>

        <h1 className="text-xl font-semibold text-text-primary mb-2">
          {step === 'info' ? 'Create your account' : 'Verify your phone'}
        </h1>
        <p className="text-sm text-text-muted mb-6">
          {step === 'info'
            ? 'Join AncerLarins to find your perfect property'
            : `Enter the 6-digit code sent to ${form.phone}`}
        </p>

        {error && (
          <div className="bg-error/10 text-error p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        {step === 'info' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:border-accent-dark text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:border-accent-dark text-text-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Phone Number</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+234 801 234 5678"
                className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:border-accent-dark text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email (optional)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:border-accent-dark text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">I am a...</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'user' })}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${form.role === 'user' ? 'bg-primary text-white border-primary' : 'bg-background text-text-secondary border-border hover:border-accent-dark'}`}
                >
                  Buyer / Tenant
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'agent' })}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${form.role === 'agent' ? 'bg-primary text-white border-primary' : 'bg-background text-text-secondary border-border hover:border-accent-dark'}`}
                >
                  Agent
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={regLoading}
              className="w-full bg-accent hover:bg-accent-dark text-primary py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {regLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:border-accent-dark text-text-primary text-center text-2xl tracking-[0.5em] font-mono"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={otpLoading || otp.length !== 6}
              className="w-full bg-accent hover:bg-accent-dark text-primary py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {otpLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('info'); setOtp(''); setError(''); }}
              className="w-full text-text-muted hover:text-text-secondary text-sm py-2"
            >
              Back to registration
            </button>
          </form>
        )}

        <p className="text-sm text-text-muted mt-8 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-accent-dark font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}
