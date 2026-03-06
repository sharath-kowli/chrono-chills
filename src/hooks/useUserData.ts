import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function getUserId() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

// Watch History
export function useWatchHistory() {
  return useQuery({
    queryKey: ["watch_history"],
    queryFn: async () => {
      const userId = await getUserId();
      if (!userId) return [];
      const { data, error } = await supabase
        .from("watch_history")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return data;
    },
  });
}

export function useEpisodeProgress(episodeId: string) {
  return useQuery({
    queryKey: ["watch_history", episodeId],
    queryFn: async () => {
      const userId = await getUserId();
      if (!userId) return null;
      const { data, error } = await supabase
        .from("watch_history")
        .select("*")
        .eq("user_id", userId)
        .eq("episode_id", episodeId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!episodeId,
  });
}

export function useUpdateWatchProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ episodeId, timestamp, completed }: { episodeId: string; timestamp?: number; completed?: boolean }) => {
      const userId = await getUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("watch_history")
        .upsert(
          { user_id: userId, episode_id: episodeId, timestamp: timestamp ?? 0, completed: completed ?? false },
          { onConflict: "user_id,episode_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watch_history"] });
    },
  });
}

// Bookmarks
export function useBookmarks() {
  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const userId = await getUserId();
      if (!userId) return [];
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return data;
    },
  });
}

export function useIsBookmarked(episodeId: string) {
  return useQuery({
    queryKey: ["bookmarks", episodeId],
    queryFn: async () => {
      const userId = await getUserId();
      if (!userId) return false;
      const { data, error } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("user_id", userId)
        .eq("episode_id", episodeId)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!episodeId,
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (episodeId: string) => {
      const userId = await getUserId();
      if (!userId) throw new Error("Not authenticated");
      const { data: existing } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("user_id", userId)
        .eq("episode_id", episodeId)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase.from("bookmarks").delete().eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("bookmarks").insert({ user_id: userId, episode_id: episodeId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}
