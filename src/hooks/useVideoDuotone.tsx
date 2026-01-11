import { useEffect } from "react";

/**
 * Global hook that applies duotone effect to all videos
 * - mouseenter: play video + remove duotone filter
 * - mouseleave: pause video + apply duotone filter
 * Works with dynamically loaded videos using MutationObserver
 */
export const useVideoDuotone = () => {
  useEffect(() => {
    const applyDuotoneToVideo = (video: HTMLVideoElement) => {
      // Skip if already processed
      if (video.dataset.duotoneApplied === "true") return;
      video.dataset.duotoneApplied = "true";

      // Apply initial duotone class
      video.classList.add("video-duotone");

      const handleMouseEnter = () => {
        video.classList.remove("video-duotone");
        video.play().catch(() => {
          // Ignore autoplay errors
        });
      };

      const handleMouseLeave = () => {
        video.classList.add("video-duotone");
        video.pause();
      };

      video.addEventListener("mouseenter", handleMouseEnter);
      video.addEventListener("mouseleave", handleMouseLeave);

      // Store cleanup functions on the element
      (video as any)._duotoneCleanup = () => {
        video.removeEventListener("mouseenter", handleMouseEnter);
        video.removeEventListener("mouseleave", handleMouseLeave);
      };
    };

    const processAllVideos = () => {
      const videos = document.querySelectorAll("video");
      videos.forEach((video) => applyDuotoneToVideo(video as HTMLVideoElement));
    };

    // Process existing videos
    processAllVideos();

    // Observe for dynamically added videos
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLVideoElement) {
            applyDuotoneToVideo(node);
          }
          if (node instanceof HTMLElement) {
            const videos = node.querySelectorAll("video");
            videos.forEach((video) => applyDuotoneToVideo(video as HTMLVideoElement));
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      // Cleanup all video listeners
      const videos = document.querySelectorAll("video");
      videos.forEach((video) => {
        const cleanup = (video as any)._duotoneCleanup;
        if (cleanup) cleanup();
      });
    };
  }, []);
};

export default useVideoDuotone;
