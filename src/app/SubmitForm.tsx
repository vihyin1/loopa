'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type ChallengeType = 'text' | 'photo' | 'poll';

export default function SubmitForm({
  challengeId,
  type,
}: {
  challengeId: number;
  type: ChallengeType;
}) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('loopa_name');
    if (saved) setName(saved);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setMessage('⚠️ Enter your name');
      return;
    }
    if (type === 'photo' && !file) {
      setMessage('⚠️ Photo required for this challenge');
      return;
    }
    if (type === 'text' && !content.trim()) {
      setMessage('⚠️ Type your answer');
      return;
    }
    if (type === 'poll' && !content.trim()) {
      setMessage('⚠️ Pick an option');
      return;
    }

    setLoading(true);
    setMessage('');
    localStorage.setItem('loopa_name', name.trim());

    let imageUrl: string | null = null;

    if (file) {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('entries')
        .upload(fileName, file);

      if (uploadError) {
        setLoading(false);
        setMessage('❌ Upload failed: ' + uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('entries')
        .getPublicUrl(fileName);

      imageUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from('entries').insert({
      user_name: name.trim(),
      content: content.trim(),
      challenge_id: challengeId,
      image_url: imageUrl,
    });

    setLoading(false);

    if (error) {
      setMessage('❌ ' + error.message);
    } else {
      setMessage('🎉 Submitted!');
      setContent('');
      setFile(null);
      setPreview(null);
      router.refresh();
      setTimeout(() => setMessage(''), 2000);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white/15 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-white/20 flex flex-col gap-3"
    >
      {/* NAME — always shown */}
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="px-5 py-3.5 rounded-2xl bg-white/95 text-gray-900 placeholder-gray-500 outline-none focus:ring-4 focus:ring-white/40 transition font-medium"
      />

      {/* TEXT challenge → answer input only */}
      {type === 'text' && (
        <input
          type="text"
          placeholder="Your answer..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="px-5 py-3.5 rounded-2xl bg-white/95 text-gray-900 placeholder-gray-500 outline-none focus:ring-4 focus:ring-white/40 transition font-medium"
        />
      )}

      {/* PHOTO challenge → upload + optional caption */}
      {type === 'photo' && (
        <>
          <label className="cursor-pointer bg-white/25 hover:bg-white/35 transition border border-white/30 rounded-2xl px-5 py-3.5 text-center font-medium text-sm">
            {file
              ? `📎 ${file.name.slice(0, 25)}${file.name.length > 25 ? '...' : ''}`
              : '📷 Add a photo (required)'}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full rounded-2xl max-h-64 object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="absolute top-2 right-2 bg-black/60 text-white w-8 h-8 rounded-full text-sm"
              >
                ✕
              </button>
            </div>
          )}

          <input
            type="text"
            placeholder="Caption (optional)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="px-5 py-3.5 rounded-2xl bg-white/95 text-gray-900 placeholder-gray-500 outline-none focus:ring-4 focus:ring-white/40 transition font-medium"
          />
        </>
      )}

      {/* POLL challenge → two buttons */}
      {type === 'poll' && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setContent('Option A')}
            className={`flex-1 py-3.5 rounded-2xl font-bold transition ${
              content === 'Option A'
                ? 'bg-white text-fuchsia-600'
                : 'bg-white/25 hover:bg-white/35'
            }`}
          >
            A
          </button>
          <button
            type="button"
            onClick={() => setContent('Option B')}
            className={`flex-1 py-3.5 rounded-2xl font-bold transition ${
              content === 'Option B'
                ? 'bg-white text-fuchsia-600'
                : 'bg-white/25 hover:bg-white/35'
            }`}
          >
            B
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-white text-fuchsia-600 font-extrabold px-6 py-3.5 rounded-2xl text-lg shadow-lg hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '⏳ Submitting...' : '🚀 Submit Entry'}
      </button>

      {name && (
        <p className="text-xs text-center opacity-70">
          👋 Welcome back, {name}. We remembered your name.
        </p>
      )}

      {message && (
        <p className="text-sm text-center font-medium fade-in">{message}</p>
      )}
    </form>
  );
}