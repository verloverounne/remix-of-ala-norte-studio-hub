import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "a-scene": any;
      "a-sky": any;
      "a-camera": any;
    }
  }
}

interface Viewer360Props {
  imageSrc: string;
  height?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

const Viewer360 = ({ imageSrc, height = "1000px", title, subtitle, ctaText, ctaLink }: Viewer360Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load A-Frame script dynamically
    const existingScript = document.querySelector('script[src*="aframe"]');

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://aframe.io/releases/1.4.2/aframe.min.js";
      script.async = true;
      script.onload = () => {
        createScene();
      };
      document.head.appendChild(script);
    } else {
      // A-Frame already loaded
      setTimeout(() => createScene(), 100);
    }

    function createScene() {
      if (!containerRef.current) return;

      // Clear existing scene if any
      const sceneContainer = containerRef.current.querySelector(".a-scene-container");
      if (sceneContainer) {
        sceneContainer.innerHTML = "";
      }

      // Create scene HTML with inverted image (scale -1 on X axis)
      const sceneHTML = `
        <a-scene 
          embedded 
          style="width: 100%; height: ${height};"
          vr-mode-ui="enabled: false"
          loading-screen="enabled: false"
        >
          <a-sky src="${imageSrc}" rotation="0 0 0" scale="-1 1 1"></a-sky>
          <a-camera look-controls="reverseMouseDrag: true; touchEnabled: true" fov="120"></a-camera>
        </a-scene>
      `;

      if (sceneContainer) {
        sceneContainer.innerHTML = sceneHTML;
      }
    }

    return () => {
      const sceneContainer = containerRef.current?.querySelector(".a-scene-container");
      if (sceneContainer) {
        sceneContainer.innerHTML = "";
      }
    };
  }, [imageSrc, height]);

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-lg border border-foreground relative"
        style={{ height, width: "100%" }}
      >
        <div className="a-scene-container w-full h-full" style={{ height }} />

        {/* Overlay HTML con clases CSS de la página */}
        {(title || subtitle || ctaText) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
            <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 pointer-events-auto">
              {title && (
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-heading font-bold uppercase tracking-wider text-background text-center px-4">
                  {title}
                </h2>
              )}
              {subtitle && (
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-5xl font-heading font-bold uppercase tracking-wider text-muted-foreground text-center px-4">
                  {subtitle}
                </h3>
              )}
              {ctaText && (
                <div className="mt-2">
                  {ctaLink ? (
                    <Button asChild variant="default" size="default" className="pointer-events-auto">
                      <Link to={ctaLink}>{ctaText}</Link>
                    </Button>
                  ) : (
                    <Button variant="default" size="default" className="pointer-events-auto">
                      {ctaText}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Viewer360;
