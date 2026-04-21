import { useParams } from "react-router-dom";
import { series } from "@/data/episodes";
import { ProtectedRoute } from "./ProtectedRoute";

export function ConditionalProtectedRoute({ children }: { children: React.ReactNode }) {
  const { episodeId } = useParams<{ episodeId: string }>();
  const episode = series.episodes.find((ep) => ep.id === episodeId);
  
  // Free episodes (number < 10) don't require auth
  const isFreeEpisode = episode && episode.number < 13;
  
  if (isFreeEpisode) {
    return <>{children}</>;
  }
  
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
