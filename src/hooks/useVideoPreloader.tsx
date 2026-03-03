/**
 * Video preloader - uses dynamic gallery data with cache.
 */

import { useState, useEffect, useRef } from "react";
import { useGalleryImages } from "@/hooks/useGalleryImages";

interface UseVideoPreloaderResult {
  progress: number;
  isComplete: boolean;
  isLoading: boolean;
}

const MIN_DISPLAY_TIME = 1500;
const MAX_TIMEOUT = 8000;

export function useVideoPreloader(): UseVideoPreloaderResult {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { getByPageType, loading: galleryLoading } = useGalleryImages();

  const startTimeRef = useRef<number>(Date.now());
  const videosLoadedRef = useRef<Set<string>>(new Set());
  const totalVideosRef = useRef<number>(0);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (galleryLoading || hasStartedRef.current) return;
    hasStartedRef.current = true;

    const heroImages = getByPageType("home_hero");
    const videoUrls: string[] = [];

    heroImages.forEach((img) => {
      if (img.media_type === "video" && img.image_url) {
        videoUrls.push(img.image_url);
      }
      if (img.vertical_video_url) {
        videoUrls.push(img.vertical_video_url);
      }
    });

    const uniqueVideoUrls = [...new Set(videoUrls)];
    totalVideosRef.current = uniqueVideoUrls.length;

    if (uniqueVideoUrls.length === 0) {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 100));
      }, remaining / 20);

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

    const videoElements: HTMLVideoElement[] = [];

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

    const handleVideoLoaded = (url: string) => {
      if (videosLoadedRef.current.has(url)) return;
      videosLoadedRef.current.add(url);
      const loadedCount = videosLoadedRef.current.size;
      setProgress((loadedCount / totalVideosRef.current) * 100);
      if (loadedCount >= totalVideosRef.current) {
        completeLoading();
      }
    };

    uniqueVideoUrls.forEach((url) => {
      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";
      video.addEventListener("canplaythrough", () => handleVideoLoaded(url), { once: true });
      video.addEventListener("loadeddata", () => handleVideoLoaded(url), { once: true });
      video.addEventListener("error", () => handleVideoLoaded(url), { once: true });
      video.src = url;
      video.load();
      videoElements.push(video);
    });

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
