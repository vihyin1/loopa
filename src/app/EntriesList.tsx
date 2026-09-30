import { supabase } from '@/lib/supabase';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function EntriesList({ challengeId }: { challengeId: number }) {
  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <p className="text-red-200 mt-6 text-center max-w-md mx-auto">
        Error loading entries: {error.message}
      </p>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center mt-4">
        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-3xl p-10 shadow-xl">
          <div className="text-6xl mb-4">👀</div>
          <h3 className="text-2xl font-extrabold mb-2">No entries yet</h3>
          <p className="opacity-80 text-sm">
            Be the first to answer! Your entry shows up here instantly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto flex flex-col gap-3">
      <div className="flex items-center gap-3 my-2">
        <div className="flex-1 h-px bg-white/30" />
        <p className="text-xs font-bold tracking-widest opacity-80">
          {entries.length} {entries.length === 1 ? 'ENTRY' : 'ENTRIES'}
        </p>
        <div className="flex-1 h-px bg-white/30" />
      </div>

      {entries.map((entry, i) => (
        <div
          key={entry.id}
          className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-left shadow-lg fade-in hover:bg-white/20 transition"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-pink-400 flex items-center justify-center text-sm font-bold">
                {entry.user_name.charAt(0).toUpperCase()}
              </div>
              <p className="font-bold text-sm">{entry.user_name}</p>
            </div>
            <p className="text-xs opacity-60">{timeAgo(entry.created_at)}</p>
          </div>

          {entry.image_url && (
            <img
              src={entry.image_url}
              alt={entry.content || 'Entry'}
              className="w-full rounded-xl mb-2 max-h-96 object-cover"
            />
          )}

          {entry.content && (
            <p className="ml-10 text-[15px] leading-snug">{entry.content}</p>
          )}
        </div>
      ))}
    </div>
  );
}