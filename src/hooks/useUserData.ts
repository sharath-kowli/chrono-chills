import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// --- Types ---
export interface WatchHistory {
  id: string;
  user_id: string;
  episode_id: string;
  timestamp: number;
  completed: boolean;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  episode_id: string;
  created_at: string;
}

// --- Watch History Hooks ---

export function useWatchHistory() {
  return useQuery({
    queryKey: ["watch-history"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from("watch_history" as any)
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (data as unknown) as WatchHistory[];
    },
  });
}

export function useEpisodeProgress(episodeId: string) {
  return useQuery({
    queryKey: ["watch-history", episodeId],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from("watch_history" as any)
        .select("*")
        .eq("episode_id", episodeId)
        .maybeSingle();

      if (error) throw error;
      return (data as unknown) as WatchHistory | null;
    },
    enabled: !!episodeId,
  });
}

export function useUpdateWatchProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      episodeId,
      timestamp,
      completed = false,
    }: {
      episodeId: string;
      timestamp: number;
      completed?: boolean;
    }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      const { error } = await supabase.from("watch_history" as any).upsert(
        {
          user_id: session.user.id,
          episode_id: episodeId,
          timestamp: Math.floor(timestamp),
          completed,
        } as any,
        { onConflict: "user_id,episode_id" },
      );

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["watch-history"] });
      queryClient.invalidateQueries({ queryKey: ["watch-history", variables.episodeId] });
    },
  });
}

// --- Bookmarks Hooks ---

export function useBookmarks() {
  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from("bookmarks" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as unknown) as Bookmark[];
    },
  });
}

export function useIsBookmarked(episodeId: string) {
  return useQuery({
    queryKey: ["bookmarks", episodeId],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return false;

      const { data, error } = await supabase
        .from("bookmarks" as any)
        .select("id")
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
    mutationFn: async ({ episodeId, isBookmarked }: { episodeId: string; isBookmarked: boolean }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from("bookmarks" as any)
          .delete()
          .eq("episode_id", episodeId)
          .eq("user_id", session.user.id);

        if (error) throw error;
      } else {
        // Add bookmark
        const { error } = await supabase.from("bookmarks" as any).insert({
          user_id: session.user.id,
          episode_id: episodeId,
        } as any);

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks", variables.episodeId] });
    },
  });
}
