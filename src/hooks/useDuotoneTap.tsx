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

      // Videos: toggle play/pause and filter accordingly
      const isPaused = media.paused;

      if (isPaused) {
        media.play().catch(() => {
          // ignore autoplay restrictions
        });
        setActive(media, true);
      } else {
        media.pause();
        setActive(media, false);
      }

      // Prevent accidental scroll double-tap zoom patterns
      e.preventDefault?.();
    };

    const usePointer = typeof window !== "undefined" && "PointerEvent" in window;

    if (usePointer) {
      document.addEventListener("pointerup", onTap, { passive: false });
    } else {
      document.addEventListener("click", onTap, { passive: false });
    }

    return () => {
      if (usePointer) {
        document.removeEventListener("pointerup", onTap as any);
      } else {
        document.removeEventListener("click", onTap as any);
      }
    };
  }, []);
};

export default useDuotoneTap;
