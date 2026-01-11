import { useEffect } from "react";

/**
 * Global hook that applies a duotone effect to all videos.
 *
 * Comportamiento:
 * - Por defecto: duotono aplicado
 * - Hover (mouse encima): sin filtro (colores originales)
 *
 * Importante:
 * - NO controla play/pause
 * - Fuerza atributos para autoplay loop muted playsInline
 * - Soporta videos cargados dinámicamente (MutationObserver)
 */
export const useVideoDuotone = () => {
  useEffect(() => {
    const applyToVideo = (video: HTMLVideoElement) => {
      // Skip if already processed
      if (video.dataset.duotoneApplied === "true") return;
      video.dataset.duotoneApplied = "true";

      // Ensure continuous playback attributes
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;

      // iOS/Safari attribute fallbacks
      video.setAttribute("autoplay", "");
      video.setAttribute("loop", "");
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");

      // Apply initial duotone class (hover is handled purely via CSS)
      video.classList.add("video-duotone");
    };

    const processAllVideos = () => {
      const videos = document.querySelectorAll("video");
      videos.forEach((v) => applyToVideo(v as HTMLVideoElement));
    };

    // Process existing videos
    processAllVideos();

    // Observe for dynamically added videos
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLVideoElement) {
            applyToVideo(node);
          } else if (node instanceof HTMLElement) {
            node.querySelectorAll("video").forEach((v) => applyToVideo(v as HTMLVideoElement));
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);
};

export default useVideoDuotone;

