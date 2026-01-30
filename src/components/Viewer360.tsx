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
      "a-plane": any;
    }
  }
}

interface Text3DItem {
  text: string;
  position: string;
  rotation?: string;
  link?: string;
}

// Static 3D text labels for Sala de Grabación
const STUDIO_LABELS: Text3DItem[] = [
  { text: "SALA DE GRABACIÓN", position: "0 2 -8", rotation: "0 0 0", link: "/sala-grabacion" },
  { text: "ESTUDIO DE POSTPRODUCCION", position: "-7 1 -5", rotation: "0 50 0", link: "/sala-grabacion" },
  { text: "GALERÍA DE FILMACIÓN", position: "7 1 -5", rotation: "0 -50 0", link: "/galeria" },
  { text: "PISO PINTADO DE BLANCO", position: "-4 -0.5 -7", rotation: "0 15 0" },
  { text: "11MTS DE TIRO DE CÁMARA", position: "4 -0.5 -7", rotation: "0 -15 0" },
  { text: "MONTACARGA", position: "-8 0.5 -3", rotation: "0 70 0" },
  { text: "COMEDOR", position: "8 0.5 -3", rotation: "0 -70 0", link: "/contacto" },
  { text: "INFINITO BLANCO 6M X 3M", position: "0 -1 -9", rotation: "0 0 0" },
];

interface Viewer360Props {
  imageSrc: string;
  secondImageSrc?: string;
  height?: string;
  mobileHeight?: string;
}

const Viewer360 = ({ 
  imageSrc, 
  secondImageSrc,
  height = "100vh",
  mobileHeight = "100vh",
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

      // Generate 3D text entities with click handlers - Poppins Bold style
      const textsHTML = STUDIO_LABELS.map((item, index) => `
        <a-entity 
          position="${item.position}"
          rotation="${item.rotation || '0 0 0'}"
          class="clickable-label"
          data-link="${item.link || ''}"
        >
          <a-plane 
            width="4" 
            height="0.5" 
            color="#000000" 
            opacity="0.7"
            class="label-bg"
          ></a-plane>
          <a-text 
            value="${item.text}" 
            position="0 0 0.02"
            color="#FFFFFF"
            scale="2 2 2"
            align="center"
            width="4"
            anchor="center"
            baseline="center"
          ></a-text>
          ${item.link ? '<a-text value="→" position="1.8 0 0.02" color="#FFFFFF" scale="2.5 2.5 2.5" align="center"></a-text>' : ''}
        </a-entity>
      `).join('');

      // FOV 70 = vista subjetiva normal
      const sceneHTML = `
        <a-scene 
          embedded 
          style="width: 100%; height: ${currentHeight};"
          vr-mode-ui="enabled: true"
          loading-screen="enabled: true"
          inspector="url: https://cdn.jsdelivr.net/gh/aframevr/aframe-inspector@master/dist/aframe-inspector.min.js"
        >
          <a-sky src="${currentImage}" rotation="0 -30 0" scale="-1 1 1"></a-sky>
          ${textsHTML}
          <a-camera look-controls="reverseMouseDrag: true; touchEnabled: true" fov="70" position="0 1.6 0">
            <a-cursor color="#FFFFFF" opacity="0.6" fuse="true" fuse-timeout="1200" raycaster="objects: .clickable-label"></a-cursor>
          </a-camera>
        </a-scene>
      `;

      if (sceneContainer) {
        sceneContainer.innerHTML = sceneHTML;

        // Add click listeners for labels
        setTimeout(() => {
          const scene = sceneContainer.querySelector('a-scene');
          if (scene) {
            const labels = scene.querySelectorAll('.clickable-label');
            labels.forEach((label: any) => {
              label.addEventListener('click', () => {
                const link = label.getAttribute('data-link');
                if (link) {
                  window.location.href = link;
                }
              });
              
              // Hover effect
              label.addEventListener('mouseenter', () => {
                const bg = label.querySelector('.label-bg');
                if (bg) bg.setAttribute('opacity', '0.9');
              });
              label.addEventListener('mouseleave', () => {
                const bg = label.querySelector('.label-bg');
                if (bg) bg.setAttribute('opacity', '0.7');
              });
            });
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
  }, [currentImage, height, mobileHeight, isMobile]);

  const toggleImage = () => {
    if (secondImageSrc) {
      setCurrentImage(prev => prev === imageSrc ? secondImageSrc : imageSrc);
    }
  };

  const openInNewWindow = () => {
    const textsHTML = STUDIO_LABELS.map((item) => `
      <a-entity 
        position="${item.position}"
        rotation="${item.rotation || '0 0 0'}"
        class="clickable-label"
        data-link="${item.link || ''}"
      >
        <a-plane width="4" height="0.5" color="#000000" opacity="0.7" class="label-bg"></a-plane>
        <a-text value="${item.text}" position="0 0 0.02" color="#FFFFFF" scale="2 2 2" align="center" width="4" anchor="center" baseline="center"></a-text>
        ${item.link ? '<a-text value="→" position="1.8 0 0.02" color="#FFFFFF" scale="2.5 2.5 2.5" align="center"></a-text>' : ''}
      </a-entity>
    `).join('');

    const fullHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Tour 360° - Sala de Grabación ALA NORTE</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap" rel="stylesheet">
  <script src="https://aframe.io/releases/1.4.2/aframe.min.js"></script>
  <style>
    * { font-family: 'Poppins', sans-serif; }
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
      background: rgba(0,0,0,0.9);
      color: white;
      border: none;
      cursor: pointer;
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .controls button:hover { background: rgba(30,30,30,1); }
    .hint {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 10px 20px;
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: 12px;
      z-index: 1000;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="hint">Ctrl+Alt+I para Inspector</div>
  <div class="controls">
    ${secondImageSrc ? '<button onclick="toggleImage()">Cambiar Vista</button>' : ''}
    <button onclick="openInspector()">Inspector</button>
  </div>
  <a-scene 
    vr-mode-ui="enabled: true"
    inspector="url: https://cdn.jsdelivr.net/gh/aframevr/aframe-inspector@master/dist/aframe-inspector.min.js"
  >
    <a-sky id="sky" src="${currentImage}" rotation="0 -30 0" scale="-1 1 1"></a-sky>
    ${textsHTML}
    <a-camera look-controls="reverseMouseDrag: true; touchEnabled: true" fov="70" position="0 1.6 0">
      <a-cursor color="#FFFFFF" opacity="0.6" fuse="true" fuse-timeout="1200" raycaster="objects: .clickable-label"></a-cursor>
    </a-camera>
  </a-scene>
  <script>
    const images = ['${imageSrc}'${secondImageSrc ? `, '${secondImageSrc}'` : ''}];
    let currentIdx = 0;
    
    function toggleImage() {
      currentIdx = (currentIdx + 1) % images.length;
      document.getElementById('sky').setAttribute('src', images[currentIdx]);
    }
    
    function openInspector() {
      const scene = document.querySelector('a-scene');
      if (scene?.components?.inspector) scene.components.inspector.openInspector();
    }

    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        document.querySelectorAll('.clickable-label').forEach(label => {
          label.addEventListener('click', () => {
            const link = label.getAttribute('data-link');
            if (link) window.location.href = link;
          });
        });
      }, 1000);
    });
  </script>
</body>
</html>
    `;

    const newWindow = window.open('', '_blank');
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
        className="w-full overflow-hidden"
        style={{ height: displayHeight, width: "100%" }}
      >
        <div className="a-scene-container w-full h-full" style={{ height: displayHeight }} />
      </div>
      
      {/* Control buttons */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button 
          onClick={openInNewWindow}
          variant="secondary"
          size="sm"
          className="shadow-lg backdrop-blur-sm bg-black/80 text-white border-0 font-heading font-bold uppercase tracking-wider hover:bg-black"
        >
          <Maximize2 className="h-4 w-4 mr-1" />
          Pantalla Completa
        </Button>
      </div>
      
      {/* Toggle button */}
      {secondImageSrc && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <Button 
            onClick={toggleImage}
            variant="default"
            size="lg"
            className="shadow-lg backdrop-blur-sm bg-black text-white font-heading font-bold uppercase tracking-wider hover:bg-black/90"
          >
            {currentImage === imageSrc ? "→ Ver otra vista" : "← Volver a inicio"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Viewer360;
