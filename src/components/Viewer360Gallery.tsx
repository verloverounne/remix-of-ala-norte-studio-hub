import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "a-scene": any;
      "a-sky": any;
      "a-camera": any;
      "a-text": any;
      "a-entity": any;
      "a-box": any;
      "a-plane": any;
    }
  }
}

interface Text3DItem {
  text: string;
  position: string;
  rotation?: string;
  color?: string;
  scale?: string;
  forImage?: 1 | 2 | "both"; // Which image this text appears on
}

interface Viewer360GalleryProps {
  imageSrc: string;
  secondImageSrc: string;
  height?: string;
  mobileHeight?: string;
  texts3DImage1?: Text3DItem[];
  texts3DImage2?: Text3DItem[];
}

const Viewer360Gallery = ({ 
  imageSrc, 
  secondImageSrc,
  height = "700px",
  mobileHeight = "60vh",
  texts3DImage1 = [],
  texts3DImage2 = []
}: Viewer360GalleryProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentImage, setCurrentImage] = useState(1); // 1 or 2
  const [isMobile, setIsMobile] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

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
        setTimeout(() => {
          createScene();
          setSceneReady(true);
        }, 100);
      };
      document.head.appendChild(script);
    } else {
      setTimeout(() => {
        createScene();
        setSceneReady(true);
      }, 100);
    }

    function createScene() {
      if (!containerRef.current) return;

      const sceneContainer = containerRef.current.querySelector(".a-scene-container");
      if (sceneContainer) {
        sceneContainer.innerHTML = "";
      }

      const currentHeight = isMobile ? mobileHeight : height;
      const activeImage = currentImage === 1 ? imageSrc : secondImageSrc;
      const activeTexts = currentImage === 1 ? texts3DImage1 : texts3DImage2;

      // Generate 3D text entities
      const textsHTML = activeTexts.map((item) => `
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

      // 3D Toggle button immersed in the scene
      const toggleButtonHTML = `
        <a-entity position="0 -2 -4" class="clickable-toggle">
          <a-plane 
            width="3" 
            height="0.6" 
            color="#1a1a1a" 
            opacity="0.85"
            class="toggle-btn"
          ></a-plane>
          <a-text 
            value="${currentImage === 1 ? '→ VER OTRA VISTA' : '← VOLVER A INICIO'}"
            position="0 0 0.01"
            color="#FFFFFF"
            scale="2.5 2.5 2.5"
            align="center"
            font="roboto"
            width="4"
          ></a-text>
        </a-entity>
      `;

      const sceneHTML = `
        <a-scene 
          embedded 
          style="width: 100%; height: ${currentHeight};"
          vr-mode-ui="enabled: true"
          loading-screen="enabled: true"
          inspector="url: https://cdn.jsdelivr.net/gh/aframevr/aframe-inspector@master/dist/aframe-inspector.min.js"
        >
          <a-sky src="${activeImage}" rotation="0 -30 0" scale="-1 1 1"></a-sky>
          ${textsHTML}
          ${toggleButtonHTML}
          <a-camera look-controls="reverseMouseDrag: true; touchEnabled: true" fov="80">
            <a-cursor color="#FFFFFF" opacity="0.5" fuse="true" fuse-timeout="1500"></a-cursor>
          </a-camera>
        </a-scene>
      `;

      if (sceneContainer) {
        sceneContainer.innerHTML = sceneHTML;

        // Add click listener for the toggle button after scene is created
        setTimeout(() => {
          const scene = sceneContainer.querySelector('a-scene');
          if (scene) {
            const toggleEntity = scene.querySelector('.clickable-toggle');
            if (toggleEntity) {
              toggleEntity.addEventListener('click', () => {
                setCurrentImage(prev => prev === 1 ? 2 : 1);
              });
            }

            // Also handle cursor fusing
            const cursor = scene.querySelector('a-cursor');
            if (cursor) {
              cursor.addEventListener('fusing', (e: any) => {
                const target = e.detail?.intersectedEl;
                if (target && target.closest('.clickable-toggle')) {
                  // Visual feedback could be added here
                }
              });
            }
          }
        }, 500);
      }
    }

    return () => {
      const sceneContainer = containerRef.current?.querySelector(".a-scene-container");
      if (sceneContainer) {
        sceneContainer.innerHTML = "";
      }
    };
  }, [currentImage, height, mobileHeight, isMobile, imageSrc, secondImageSrc, texts3DImage1, texts3DImage2]);

  const handleToggleImage = () => {
    setCurrentImage(prev => prev === 1 ? 2 : 1);
  };

  const openInNewWindow = () => {
    const activeImage = currentImage === 1 ? imageSrc : secondImageSrc;
    const activeTexts = currentImage === 1 ? texts3DImage1 : texts3DImage2;
    
    const textsHTML = activeTexts.map((item) => `
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

    const fullHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Tour 360° - Galería ALA NORTE</title>
  <script src="https://aframe.io/releases/1.4.2/aframe.min.js"></script>
  <style>
    body { margin: 0; overflow: hidden; }
    .controls {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      display: flex;
      gap: 10px;
    }
    .controls button {
      padding: 12px 24px;
      background: rgba(0,0,0,0.8);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-family: sans-serif;
      font-size: 14px;
    }
    .controls button:hover {
      background: rgba(50,50,50,0.9);
    }
    .hint {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-family: sans-serif;
      font-size: 14px;
      z-index: 1000;
    }
  </style>
</head>
<body>
  <div class="hint">Presiona Ctrl+Alt+I para abrir el Inspector de A-Frame</div>
  <div class="controls">
    <button onclick="toggleImage()">Cambiar Vista</button>
    <button onclick="openInspector()">Abrir Inspector</button>
  </div>
  <a-scene 
    vr-mode-ui="enabled: true"
    inspector="url: https://cdn.jsdelivr.net/gh/aframevr/aframe-inspector@master/dist/aframe-inspector.min.js"
  >
    <a-sky id="sky" src="${activeImage}" rotation="0 -30 0" scale="-1 1 1"></a-sky>
    ${textsHTML}
    <a-camera look-controls="reverseMouseDrag: true; touchEnabled: true" fov="80"></a-camera>
  </a-scene>
  <script>
    const images = ['${imageSrc}', '${secondImageSrc}'];
    let currentIdx = ${currentImage - 1};
    
    function toggleImage() {
      currentIdx = currentIdx === 0 ? 1 : 0;
      document.getElementById('sky').setAttribute('src', images[currentIdx]);
    }
    
    function openInspector() {
      const scene = document.querySelector('a-scene');
      if (scene && scene.components && scene.components.inspector) {
        scene.components.inspector.openInspector();
      }
    }
  </script>
</body>
</html>
    `;

    const newWindow = window.open('', '_blank', 'width=1200,height=800');
    if (newWindow) {
      newWindow.document.write(fullHTML);
      newWindow.document.close();
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
      
      {/* Control buttons overlaid */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button 
          onClick={openInNewWindow}
          variant="secondary"
          size="sm"
          className="shadow-lg backdrop-blur-sm bg-background/80"
        >
          <Maximize2 className="h-4 w-4 mr-1" />
          Ampliar
        </Button>
      </div>

      {/* Fallback toggle button for easier interaction */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <Button 
          onClick={handleToggleImage}
          variant="default"
          size="lg"
          className="shadow-lg backdrop-blur-sm"
        >
          {currentImage === 1 ? "→ Ver otra vista" : "← Volver a vista inicial"}
        </Button>
      </div>
    </div>
  );
};

export default Viewer360Gallery;
