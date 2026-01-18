import { useEffect } from "react";

/**
 * Global hook to enable tap-to-toggle duotone on touch devices.
 *
 * Mobile behavior:
 * - Tapping a duotone media (video/image) toggles the duotone filter.
 * - Videos: tap toggles play/pause.
 *   - When playing: filter OFF
 *   - When paused: filter ON
 *
 * Desktop behavior remains CSS hover-based (no JS).
 */
export const useDuotoneTap = () => {
  useEffect(() => {
    const isTouchDevice =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    if (!isTouchDevice) return;

    const isInteractiveElement = (el: Element | null) => {
      if (!el) return false;
      return Boolean(el.closest("a,button,input,textarea,select,label,[role='button']"));
    };

    const setActive = (media: HTMLElement, active: boolean) => {
      const group = media.closest(".duotone-hover-group") as HTMLElement | null;
      const target = group ?? media;
      if (active) target.classList.add("duotone-tap-active");
      else target.classList.remove("duotone-tap-active");
    };

    const syncVideoState = (video: HTMLVideoElement) => {
      // Playing = colores (filtro OFF) → agregar clase
      // Paused = duotono (filtro ON) → remover clase
      setActive(video, !video.paused);
    };

    // Ensure autoplay videos get the correct visual state immediately.
    const syncAllExisting = () => {
      document.querySelectorAll("video.video-duotone").forEach((el) => {
        syncVideoState(el as HTMLVideoElement);
      });
    };

    const onTap = (e: Event) => {
      const target = e.target as Element | null;
      if (!target) return;
      if (isInteractiveElement(target)) return;

      const video = target.closest("video.video-duotone") as HTMLVideoElement | null;
      const img = target.closest("img.image-duotone") as HTMLImageElement | null;

      const media = (video ?? img) as (HTMLVideoElement | HTMLImageElement | null);
      if (!media) return;

      // Images: toggle filter only
      if (media instanceof HTMLImageElement) {
        const group = media.closest(".duotone-hover-group") as HTMLElement | null;
        const holder = group ?? media;
        holder.classList.toggle("duotone-tap-active");
        return;
      }

      // Videos: toggle play/pause and keep filter synced with state
      if (media.paused) {
        media.play().catch(() => {
          // ignore autoplay restrictions
        });
      } else {
        media.pause();
      }

      // Prevent accidental scroll double-tap zoom patterns
      e.preventDefault?.();
    };

    // Capture play/pause events (they don't bubble, but they do fire in capture phase)
    const onPlay = (e: Event) => {
      const el = e.target;
      if (el instanceof HTMLVideoElement && el.classList.contains("video-duotone")) {
        syncVideoState(el);
      }
    };

    const onPause = (e: Event) => {
      const el = e.target;
      if (el instanceof HTMLVideoElement && el.classList.contains("video-duotone")) {
        syncVideoState(el);
      }
    };

    const usePointer = typeof window !== "undefined" && "PointerEvent" in window;

    if (usePointer) {
      document.addEventListener("pointerup", onTap, { passive: false });
    } else {
      document.addEventListener("click", onTap, { passive: false });
    }

    document.addEventListener("play", onPlay, true);
    document.addEventListener("pause", onPause, true);

    // Initial sync (including autoplay)
    syncAllExisting();

    return () => {
      if (usePointer) {
        document.removeEventListener("pointerup", onTap as any);
      } else {
        document.removeEventListener("click", onTap as any);
      }

      document.removeEventListener("play", onPlay, true);
      document.removeEventListener("pause", onPause, true);
    };
  }, []);
};

export default useDuotoneTap;
