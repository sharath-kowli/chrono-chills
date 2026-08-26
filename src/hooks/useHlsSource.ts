import { RefObject, useEffect, useState } from "react";
import type HlsPlayer from "hls.js";
import { hlsUrl, supportsNativeHls } from "@/lib/stream";

/**
 * Load errors tolerated before we give up and tell the viewer.
 *
 * hls.js reports most load failures as *non-fatal* and retries them on its own
 * schedule, so counting only fatal errors lets a permanently dead stream (a bad id,
 * a missing rendition, a CORS-blocked manifest) retry forever behind a poster that
 * never changes. The budget only applies before playback starts — once media is
 * flowing, a hiccup is hls.js's to recover from silently.
 */
const MAX_LOAD_ERRORS = 6;

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
    let started = false;

    const markStarted = () => {
      started = true;
    };
    video.addEventListener("playing", markStarted);
    const cleanup = () => {
      video.removeEventListener("playing", markStarted);
      video.removeEventListener("error", onNativeError);
    };

    // Native path: the element reports its own failures (404, CORS, undecodable).
    function onNativeError() {
      if (!cancelled) setSource({ status: "error" });
    }

    setSource({ status: "loading" });

    if (supportsNativeHls(video)) {
      video.addEventListener("error", onNativeError);
      video.src = url;
      video.load();
      setSource({ status: "ready", attachedStreamId: streamId });
      return () => {
        cancelled = true;
        cleanup();
        video.removeAttribute("src");
        video.load();
      };
    }

    import("hls.js")
      .then(({ default: Hls }) => {
        if (cancelled) return;
        if (!Hls.isSupported()) {
          video.addEventListener("error", onNativeError);
          video.src = url;
          video.load();
          setSource({ status: "ready", attachedStreamId: streamId });
          return;
        }

        let budget = MAX_LOAD_ERRORS;
        const giveUp = () => {
          hls?.destroy();
          hls = null;
          setSource({ status: "error" });
        };

        hls = new Hls({ capLevelToPlayerSize: true, maxBufferLength: 30 });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!hls || cancelled) return;
          // Once media is flowing, only a fatal error is our business.
          if (started && !data.fatal) return;
          if (--budget <= 0) return giveUp();
          if (!data.fatal) return; // hls.js retries non-fatal errors itself
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else giveUp();
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
      cleanup();
      hls?.destroy();
      hls = null;
    };
  }, [videoRef, streamId]);

  return source;
}
