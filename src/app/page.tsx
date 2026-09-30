import { supabase } from '@/lib/supabase';
import SubmitForm from './SubmitForm';
import EntriesList from './EntriesList';

function getTodayChallenge<T>(arr: T[]): T | null {
  if (!arr || arr.length === 0) return null;
  const now = new Date();
  const start = new Date(now.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return arr[dayOfYear % arr.length];
}

export default async function Home() {
  const { data: challenges, error } = await supabase
    .from('challenges')
    .select('*')
    .order('id', { ascending: true });

  const challenge = challenges ? getTodayChallenge(challenges) : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 text-white">
      <header className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between max-w-3xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl sm:text-3xl">⚡</span>
          <span className="text-xl sm:text-2xl font-black tracking-tight">LOOPA</span>
        </div>
        <span className="text-xs sm:text-sm opacity-80 hidden sm:block">
          Social. Fun. Daily.
        </span>
      </header>

      <section className="px-5 sm:px-6 pt-4 sm:pt-6 pb-2 max-w-2xl mx-auto text-center">
        <p className="inline-block bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-widest mb-4">
          🔥 TODAY&apos;S CHALLENGE
        </p>
        {error && (
          <p className="text-red-200 mb-4 text-sm">Error: {error.message}</p>
        )}
        {challenge ? (
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight max-w-lg mx-auto fade-in">
            {challenge.text}
          </h1>
        ) : (
          <p className="opacity-80">No challenge yet...</p>
        )}
      </section>

      {challenge && (
        <>
          <section className="px-5 sm:px-6 mt-6 sm:mt-8">
            <SubmitForm challengeId={challenge.id} type={(challenge.type as 'text' | 'photo' | 'poll') || 'text'} />
          </section>

          <section className="px-5 sm:px-6 mt-8 sm:mt-10 pb-16 sm:pb-20">
            <EntriesList challengeId={challenge.id} />
          </section>
        </>
      )}
    </main>
  );
}