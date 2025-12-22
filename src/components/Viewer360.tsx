import { useEffect, useRef, useState, useCallback } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-sky': any;
      'a-camera': any;
    }
  }
}

interface Viewer360Props {
  imageSrc: string;
  height?: string;
}

const Viewer360 = ({ imageSrc, height = "500px" }: Viewer360Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!wrapperRef.current) return;

    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error('Error exiting fullscreen:', err);
      });
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    // Load A-Frame script dynamically
    const existingScript = document.querySelector('script[src*="aframe"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://aframe.io/releases/1.4.2/aframe.min.js';
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
      containerRef.current.innerHTML = '';
      
      const currentHeight = isFullscreen ? '100vh' : height;
      
      // Create scene HTML with 2x scale on the sky
      const sceneHTML = `
        <a-scene 
          embedded 
          style="width: 100%; height: ${currentHeight};"
          vr-mode-ui="enabled: false"
          loading-screen="enabled: false"
        >
          <a-sky src="${imageSrc}" rotation="0 -90 0" scale="2 2 2"></a-sky>
          <a-camera look-controls="reverseMouseDrag: true; touchEnabled: true" fov="60"></a-camera>
        </a-scene>
      `;
      
      containerRef.current.innerHTML = sceneHTML;
      sceneRef.current = containerRef.current.querySelector('a-scene');
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [imageSrc, height, isFullscreen]);

  return (
    <div 
      ref={wrapperRef}
      className={`relative ${isFullscreen ? 'bg-black' : ''}`}
    >
      <div 
        ref={containerRef} 
        className={`w-full overflow-hidden cursor-pointer ${isFullscreen ? 'h-screen' : 'rounded-lg border-4 border-foreground'}`}
        style={{ height: isFullscreen ? '100vh' : height }}
        onClick={toggleFullscreen}
      />
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background p-2 rounded-lg border-2 border-foreground transition-all hover:scale-105"
        title={isFullscreen ? "Salir de pantalla completa (ESC)" : "Pantalla completa"}
      >
        {isFullscreen ? (
          <Minimize2 className="h-6 w-6" />
        ) : (
          <Maximize2 className="h-6 w-6" />
        )}
      </button>
      {!isFullscreen && (
        <p className="text-center text-sm text-muted-foreground mt-2 font-heading">
          CLICK PARA PANTALLA COMPLETA · ESC PARA SALIR
        </p>
      )}
    </div>
  );
};

export default Viewer360;
