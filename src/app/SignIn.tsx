'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setMessage('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setMessage('❌ ' + error.message);
    } else {
      setMessage('✅ Check your email for the magic link!');
      setEmail('');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white/15 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-white/20 flex flex-col gap-3"
    >
      <p className="text-center text-sm font-bold tracking-widest opacity-80">
        ✨ SIGN IN TO PLAY
      </p>

      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-5 py-3.5 rounded-2xl bg-white/95 text-gray-900 placeholder-gray-500 outline-none focus:ring-4 focus:ring-white/40 transition font-medium"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-white text-fuchsia-600 font-extrabold px-6 py-3.5 rounded-2xl text-lg shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
      >
        {loading ? '⏳ Sending...' : '📧 Send Magic Link'}
      </button>

      {message && (
        <p className="text-sm text-center font-medium fade-in">{message}</p>
      )}

      <p className="text-xs text-center opacity-60">
        No password needed. We&apos;ll email you a link.
      </p>
    </form>
  );
}