import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface WatchHistoryEntry {
  id: string;
  user_id: string;
  user_email: string;
  episode_id: string;
  episode_name: string;
  youtube_url: string | null;
  timestamp: number;
  completed: boolean;
  updated_at: string;
}

interface BookmarkEntry {
  id: string;
  user_id: string;
  user_email: string;
  episode_id: string;
  episode_name: string;
  created_at: string;
}

export default function Admin() {
  const [watchHistory, setWatchHistory] = useState<WatchHistoryEntry[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data, error: fnError } = await supabase.functions.invoke("admin-dashboard", {
      body: { password },
    });

    if (fnError) {
      setError(fnError.message || "Access denied");
      setLoading(false);
      return;
    }

    if (data?.error) {
      setError(data.error);
      setLoading(false);
      return;
    }

    setWatchHistory(data.watchHistory || []);
    setBookmarks(data.bookmarks || []);
    setAuthenticated(true);
    setLoading(false);
  };

  // Check if user is logged in on mount
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/auth");
    }
    checkAuth();
  }, [navigate]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <form onSubmit={handlePasswordSubmit} className="w-full max-w-sm space-y-4 p-8">
          <h1 className="text-xl font-bold text-foreground text-center">Dashboard Access</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          {error && <p className="text-destructive text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Access"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Watch History */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Watch History ({watchHistory.length})</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">User Email</th>
                <th className="text-left p-3 font-medium">Episode</th>
                <th className="text-left p-3 font-medium">YouTube URL</th>
                <th className="text-left p-3 font-medium">Progress (s)</th>
                <th className="text-left p-3 font-medium">Completed</th>
                <th className="text-left p-3 font-medium">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {watchHistory.map((entry) => (
                <tr key={entry.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs">{entry.user_email}</td>
                  <td className="p-3">{entry.episode_name}</td>
                  <td className="p-3">
                    {entry.youtube_url ? (
                      <a
                        href={entry.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline text-xs"
                      >
                        {entry.youtube_url}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3 font-mono">{entry.timestamp}</td>
                  <td className="p-3">
                    <span className={entry.completed ? "text-green-500" : "text-muted-foreground"}>
                      {entry.completed ? "✓" : "✗"}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {new Date(entry.updated_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {watchHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    No watch history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bookmarks */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Bookmarks ({bookmarks.length})</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">User Email</th>
                <th className="text-left p-3 font-medium">Episode</th>
                <th className="text-left p-3 font-medium">Bookmarked At</th>
              </tr>
            </thead>
            <tbody>
              {bookmarks.map((entry) => (
                <tr key={entry.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs">{entry.user_email}</td>
                  <td className="p-3">{entry.episode_name}</td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {new Date(entry.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {bookmarks.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-muted-foreground">
                    No bookmarks yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
