import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { useHlsSource } from "./useHlsSource";

const STREAM_ID = "c69cf60b260460f73325843ba825cbf1";

/** Minimal stand-in for the parts of <video> the hook touches. */
const makeVideo = (canPlayType: string) => {
  const el = {
    src: "",
    canPlayType: () => canPlayType,
    load: vi.fn(),
    removeAttribute: vi.fn(() => {
      el.src = "";
    }),
  };
  return el as unknown as HTMLVideoElement;
};

describe("useHlsSource", () => {
  it("assigns the manifest directly where HLS is native, without loading hls.js", async () => {
    const ref = createRef<HTMLVideoElement>();
    (ref as { current: HTMLVideoElement }).current = makeVideo("maybe");

    const { result } = renderHook(() => useHlsSource(ref, STREAM_ID));

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.attachedStreamId).toBe(STREAM_ID);
    expect(ref.current!.src).toBe(`https://videodelivery.net/${STREAM_ID}/manifest/video.m3u8`);
  });

  it("reports the attached stream so a swap is distinguishable from the previous one", async () => {
    const ref = createRef<HTMLVideoElement>();
    (ref as { current: HTMLVideoElement }).current = makeVideo("maybe");

    const { result, rerender } = renderHook(({ id }) => useHlsSource(ref, id), {
      initialProps: { id: STREAM_ID },
    });
    await waitFor(() => expect(result.current.attachedStreamId).toBe(STREAM_ID));

    const nextId = "c145d7980bd0f0a588593d3d1d410db4";
    rerender({ id: nextId });
    await waitFor(() => expect(result.current.attachedStreamId).toBe(nextId));
    expect(ref.current!.src).toContain(nextId);
  });

  it("stays in loading until a source is attached", () => {
    const ref = createRef<HTMLVideoElement>();
    const { result } = renderHook(() => useHlsSource(ref, undefined));
    expect(result.current.status).toBe("loading");
    expect(result.current.attachedStreamId).toBeUndefined();
  });
});
