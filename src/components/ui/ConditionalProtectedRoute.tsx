import { useParams } from "react-router-dom";
import { allSeries } from "@/data/episodes";
import { ProtectedRoute } from "./ProtectedRoute";
import { isCredentialsUnlocked } from "@/lib/unlock";

export function ConditionalProtectedRoute({ children }: { children: React.ReactNode }) {
  const { episodeId } = useParams<{ episodeId: string }>();
  const episode = allSeries.flatMap((s) => s.episodes).find((ep) => ep.id === episodeId);

  // Free episodes (number < 13) don't require auth
  const isFreeEpisode = episode && episode.number < 13;

  // Credentials-based unlock grants access without Google sign-in
  if (isFreeEpisode || isCredentialsUnlocked()) {
    return <>{children}</>;
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
}
