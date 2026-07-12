import { useState } from 'react';
import type { FormEvent } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../context/AuthContext';

// Conteúdo do modal de login/cadastro (e-mail/senha + OAuth).
export function AuthModal({ onDone }: { onDone: () => void }) {
  const { lang } = useI18n();
  const { signIn, signUp, signInWithOAuth } = useAuth();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const L = (pt: string, en: string) => (lang === 'pt' ? pt : en);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    if (mode === 'in') {
      const err = await signIn(email, password);
      if (err) setError(err);
      else onDone();
    } else {
      const err = await signUp(email, password);
      if (err) setError(err);
      else setMessage(L('Enviamos um e-mail de confirmação. Verifique sua caixa.', 'Check your email for a confirmation link.'));
    }
    setBusy(false);
  };

  return (
    <div className="auth-modal">
      <h2 className="auth-modal__title">
        {mode === 'in' ? L('Entrar', 'Sign in') : L('Criar conta', 'Sign up')}
      </h2>

      <div className="auth-oauth">
        <button type="button" className="auth-oauth__btn" onClick={() => void signInWithOAuth('google')}>
           Google
        </button>
        <button type="button" className="auth-oauth__btn" onClick={() => void signInWithOAuth('discord')}>
           Discord
        </button>
      </div>

      <div className="auth-divider">{L('ou', 'or')}</div>

      <form className="auth-form" onSubmit={submit}>
        <input
          type="email"
          className="auth-input"
          placeholder="e-mail"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="auth-input"
          placeholder={L('senha', 'password')}
          autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
          minLength={6}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-message">{message}</p>}
        <button type="submit" className="auth-submit" disabled={busy}>
          {busy ? '…' : mode === 'in' ? L('Entrar', 'Sign in') : L('Criar conta', 'Sign up')}
        </button>
      </form>

      <button
        type="button"
        className="auth-toggle"
        onClick={() => {
          setMode((m) => (m === 'in' ? 'up' : 'in'));
          setError(null);
          setMessage(null);
        }}
      >
        {mode === 'in'
          ? L('Não tem conta? Criar', "No account? Sign up")
          : L('Já tem conta? Entrar', 'Have an account? Sign in')}
      </button>
    </div>
  );
}
