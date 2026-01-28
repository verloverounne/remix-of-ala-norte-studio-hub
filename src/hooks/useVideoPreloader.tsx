import { useState, useEffect, useCallback, useRef } from "react";
import { useGalleryImages } from "./useGalleryImages";

interface UseVideoPreloaderResult {
  progress: number;
  isComplete: boolean;
  isLoading: boolean;
}

const MIN_DISPLAY_TIME = 1500; // Minimum 1.5s display time
const MAX_TIMEOUT = 8000; // Maximum 8s timeout

export function useVideoPreloader(): UseVideoPreloaderResult {
  const { getByPageType, loading: galleryLoading } = useGalleryImages();
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const startTimeRef = useRef<number>(Date.now());
  const videosLoadedRef = useRef<Set<string>>(new Set());
  const totalVideosRef = useRef<number>(0);

  useEffect(() => {
    if (galleryLoading) return;

    const heroImages = getByPageType("home_hero");
    const videoUrls = heroImages
      .filter((img) => img.media_type === "video" && img.image_url)
      .map((img) => img.image_url);

    // Also include vertical videos if present
    heroImages.forEach((img) => {
      if (img.vertical_video_url) {
        videoUrls.push(img.vertical_video_url);
      }
    });

    // Remove duplicates
    const uniqueVideoUrls = [...new Set(videoUrls)];
    totalVideosRef.current = uniqueVideoUrls.length;

    // If no videos, complete after minimum display time
    if (uniqueVideoUrls.length === 0) {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);
      
      // Animate progress to 100
      const animateProgress = () => {
        setProgress((prev) => {
          if (prev >= 100) return 100;
          return Math.min(prev + 5, 100);
        });
      };
      
      const interval = setInterval(animateProgress, remaining / 20);
      
      setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setIsComplete(true);
          setIsLoading(false);
        }, 500);
      }, remaining);
      
      return;
    }

    // Preload each video
    const videoElements: HTMLVideoElement[] = [];
    
    const handleVideoLoaded = (url: string) => {
      if (videosLoadedRef.current.has(url)) return;
      
      videosLoadedRef.current.add(url);
      const loadedCount = videosLoadedRef.current.size;
      const newProgress = (loadedCount / totalVideosRef.current) * 100;
      setProgress(newProgress);

      // Check if all videos loaded
      if (loadedCount >= totalVideosRef.current) {
        completeLoading();
      }
    };

    const completeLoading = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);
      
      setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setIsComplete(true);
          setIsLoading(false);
        }, 500);
      }, remaining);
    };

    // Create hidden video elements to preload
    uniqueVideoUrls.forEach((url) => {
      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";
      
      video.addEventListener("canplaythrough", () => handleVideoLoaded(url), { once: true });
      video.addEventListener("loadeddata", () => handleVideoLoaded(url), { once: true });
      video.addEventListener("error", () => handleVideoLoaded(url), { once: true }); // Count errors as loaded to not block
      
      video.src = url;
      video.load();
      videoElements.push(video);
    });

    // Timeout fallback
    const timeoutId = setTimeout(() => {
      console.warn("[useVideoPreloader] Timeout reached, completing anyway");
      completeLoading();
    }, MAX_TIMEOUT);

    return () => {
      clearTimeout(timeoutId);
      videoElements.forEach((v) => {
        v.src = "";
        v.load();
      });
    };
  }, [galleryLoading, getByPageType]);

  return { progress, isComplete, isLoading };
}
