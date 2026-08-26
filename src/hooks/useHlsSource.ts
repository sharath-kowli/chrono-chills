import { RefObject, useEffect, useState } from "react";
import type HlsPlayer from "hls.js";
import { hlsUrl, supportsNativeHls } from "@/lib/stream";

export type SourceStatus = "loading" | "ready" | "error";

export interface HlsSource {
  status: SourceStatus;
  /** The stream currently attached to the element — lags `streamId` while a swap is in flight. */
  attachedStreamId?: string;
}

/**
 * Points a <video> element at a Cloudflare Stream HLS manifest.
 *
 * Safari (and every browser on iOS, which is Safari underneath) decodes HLS natively,
 * so it gets the manifest straight on `video.src` and never downloads hls.js. Everything
 * else loads hls.js lazily and feeds the element through MSE.
 *
 * The element itself is deliberately reused across episodes: WebKit records "the user
 * started this one" per element, so swapping the source keeps playback unlocked while
 * mounting a fresh <video> would demand a new tap for every episode.
 */
export function useHlsSource(videoRef: RefObject<HTMLVideoElement>, streamId?: string): HlsSource {
  const [source, setSource] = useState<HlsSource>({ status: "loading" });

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamId) return;

    const url = hlsUrl(streamId);
    let cancelled = false;
    let hls: HlsPlayer | null = null;

    setSource({ status: "loading" });

    if (supportsNativeHls(video)) {
      video.src = url;
      video.load();
      setSource({ status: "ready", attachedStreamId: streamId });
      return () => {
        video.removeAttribute("src");
        video.load();
      };
    }

    import("hls.js")
      .then(({ default: Hls }) => {
        if (cancelled) return;
        if (!Hls.isSupported()) {
          video.src = url;
          video.load();
          setSource({ status: "ready", attachedStreamId: streamId });
          return;
        }
        hls = new Hls({ capLevelToPlayerSize: true, maxBufferLength: 30 });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!data.fatal || !hls) return;
          // Fatal network/media errors are usually recoverable; anything else is terminal.
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else setSource({ status: "error" });
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        setSource({ status: "ready", attachedStreamId: streamId });
      })
      .catch(() => {
        if (!cancelled) setSource({ status: "error" });
      });

    return () => {
      cancelled = true;
      hls?.destroy();
      hls = null;
    };
  }, [videoRef, streamId]);

  return source;
}
