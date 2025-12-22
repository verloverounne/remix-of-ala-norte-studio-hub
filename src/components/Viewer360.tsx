import { useEffect, useRef } from "react";

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
  const sceneRef = useRef<HTMLElement | null>(null);

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
      
      // Create scene HTML
      const sceneHTML = `
        <a-scene 
          embedded 
          style="width: 100%; height: ${height};"
          vr-mode-ui="enabled: false"
          loading-screen="enabled: false"
        >
          <a-sky src="${imageSrc}" rotation="0 -90 0"></a-sky>
          <a-camera look-controls="reverseMouseDrag: true; touchEnabled: true"></a-camera>
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
  }, [imageSrc, height]);

  return (
    <div 
      ref={containerRef} 
      className="w-full rounded-lg overflow-hidden border-4 border-foreground"
      style={{ height }}
    />
  );
};

export default Viewer360;
