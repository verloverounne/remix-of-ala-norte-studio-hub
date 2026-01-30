import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "a-scene": any;
      "a-sky": any;
      "a-camera": any;
      "a-text": any;
      "a-entity": any;
    }
  }
}

interface Text3DItem {
  text: string;
  position: string; // "x y z"
  rotation?: string; // "x y z"
  color?: string;
  scale?: string;
}

interface Viewer360Props {
  imageSrc: string;
  secondImageSrc?: string;
  height?: string;
  mobileHeight?: string;
  texts3D?: Text3DItem[];
}

const Viewer360 = ({ 
  imageSrc, 
  secondImageSrc,
  height = "1000px",
  mobileHeight = "80vh",
  texts3D = []
}: Viewer360Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentImage, setCurrentImage] = useState(imageSrc);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
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
      setTimeout(() => createScene(), 100);
    }

    function createScene() {
      if (!containerRef.current) return;

      const sceneContainer = containerRef.current.querySelector(".a-scene-container");
      if (sceneContainer) {
        sceneContainer.innerHTML = "";
      }

      const currentHeight = isMobile ? mobileHeight : height;

      // Generate 3D text entities
      const textsHTML = texts3D.map((item, index) => `
        <a-text 
          value="${item.text}" 
          position="${item.position}"
          rotation="${item.rotation || '0 0 0'}"
          color="${item.color || '#FFFFFF'}"
          scale="${item.scale || '8 8 8'}"
          align="center"
          font="roboto"
          width="6"
        ></a-text>
      `).join('');

      // FOV 80 = vista más natural/normal de persona
      const sceneHTML = `
        <a-scene 
          embedded 
          style="width: 100%; height: ${currentHeight};"
          vr-mode-ui="enabled: true"
          loading-screen="enabled: true"
        >
          <a-sky src="${currentImage}" rotation="0 -30 0" scale="-1 1 1"></a-sky>
          ${textsHTML}
          <a-camera look-controls="reverseMouseDrag: true; touchEnabled: true" fov="80"></a-camera>
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
  }, [currentImage, height, mobileHeight, isMobile, texts3D]);

  const toggleImage = () => {
    if (secondImageSrc) {
      setCurrentImage(prev => prev === imageSrc ? secondImageSrc : imageSrc);
    }
  };

  const displayHeight = isMobile ? mobileHeight : height;

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-lg"
        style={{ height: displayHeight, width: "100%" }}
      >
        <div className="a-scene-container w-full h-full" style={{ height: displayHeight }} />
      </div>
      
      {/* Botón interactivo superpuesto */}
      {secondImageSrc && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <Button 
            onClick={toggleImage}
            variant="default"
            size="lg"
            className="shadow-lg backdrop-blur-sm"
          >
            <Eye className="mr-2 h-5 w-5" />
            {currentImage === imageSrc ? "Ver otra vista" : "Volver a vista inicial"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Viewer360;
