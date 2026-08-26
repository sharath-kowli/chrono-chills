import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createRef } from "react";
import { useHlsSource } from "./useHlsSource";

const STREAM_ID = "c69cf60b260460f73325843ba825cbf1";
const OTHER_ID = "c145d7980bd0f0a588593d3d1d410db4";

/** A real element so listeners work; jsdom has no media pipeline, so load() is stubbed. */
const makeVideo = (canPlayType: string) => {
  const el = document.createElement("video");
  Object.defineProperty(el, "canPlayType", { value: () => canPlayType });
  el.load = vi.fn();
  return el;
};

const refTo = (el: HTMLVideoElement) => {
  const ref = createRef<HTMLVideoElement>();
  (ref as { current: HTMLVideoElement }).current = el;
  return ref;
};

describe("useHlsSource", () => {
  it("assigns the manifest directly where HLS is native, without loading hls.js", async () => {
    const ref = refTo(makeVideo("maybe"));
    const { result } = renderHook(() => useHlsSource(ref, STREAM_ID));

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.attachedStreamId).toBe(STREAM_ID);
    expect(ref.current!.src).toBe(`https://videodelivery.net/${STREAM_ID}/manifest/video.m3u8`);
  });

  it("reports the attached stream so a swap is distinguishable from the previous one", async () => {
    const ref = refTo(makeVideo("maybe"));
    const { result, rerender } = renderHook(({ id }) => useHlsSource(ref, id), {
      initialProps: { id: STREAM_ID },
    });
    await waitFor(() => expect(result.current.attachedStreamId).toBe(STREAM_ID));

    rerender({ id: OTHER_ID });
    await waitFor(() => expect(result.current.attachedStreamId).toBe(OTHER_ID));
    expect(ref.current!.src).toContain(OTHER_ID);
  });

  it("surfaces an error when the element rejects the source, rather than sitting on the poster", async () => {
    const video = makeVideo("maybe");
    const ref = refTo(video);
    const { result } = renderHook(() => useHlsSource(ref, STREAM_ID));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    // A 404 or CORS-blocked manifest reaches the element as a plain error event.
    act(() => {
      video.dispatchEvent(new Event("error"));
    });
    await waitFor(() => expect(result.current.status).toBe("error"));
  });

  it("stops listening once unmounted so a late error cannot revive the state", async () => {
    const video = makeVideo("maybe");
    const ref = refTo(video);
    const { result, unmount } = renderHook(() => useHlsSource(ref, STREAM_ID));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    unmount();
    act(() => {
      video.dispatchEvent(new Event("error"));
    });
    expect(result.current.status).toBe("ready");
  });

  it("stays in loading until a source is attached", () => {
    const ref = createRef<HTMLVideoElement>();
    const { result } = renderHook(() => useHlsSource(ref, undefined));
    expect(result.current.status).toBe("loading");
    expect(result.current.attachedStreamId).toBeUndefined();
  });
});
