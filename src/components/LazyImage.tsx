import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  onLoad?: () => void;
  aspectRatio?: "video" | "square" | "portrait";
}

export const LazyImage = ({
  src,
  alt,
  className,
  placeholderClassName,
  onLoad,
  aspectRatio = "video",
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px",
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const aspectRatioClass = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
  }[aspectRatio];

  // Si placeholderClassName contiene w-full h-full, no usar aspectRatioClass
  const shouldUseAspectRatio = !placeholderClassName?.includes("w-full") || !placeholderClassName?.includes("h-full");

  return (
    <div
      ref={imgRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        shouldUseAspectRatio && aspectRatioClass,
        placeholderClassName
      )}
    >
      {/* Skeleton loading animation */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent animate-[shimmer_1.5s_infinite] -translate-x-full" />
        </div>
      )}
      
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={cn(
            "absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 image-duotone",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={handleLoad}
          loading="lazy"
        />
      )}
    </div>
  );
};
