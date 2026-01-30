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
  link?: string; // URL to navigate or scene to switch
  isSceneLink?: boolean; // If true, switches to another scene instead of URL
}

interface Viewer360GalleryProps {
  imageSrc: string;
  secondImageSrc: string;
  thirdImageSrc?: string; // For additional scenes like COMEDOR
  fourthImageSrc?: string; // For additional scenes like SALA DE GRABACIÓN
  height?: string;
  mobileHeight?: string;
}

// Static 3D text labels with their positions and links
const GALLERY_LABELS: Text3DItem[] = [
  { text: "SALA DE GRABACIÓN", position: "-8 1.5 -6", rotation: "0 45 0", link: "/sala-grabacion", isSceneLink: false },
  { text: "ESTUDIO DE POSTPRODUCCION", position: "8 1.5 -6", rotation: "0 -45 0", link: "/sala-grabacion", isSceneLink: false },
  { text: "GALERÍA DE FILMACIÓN", position: "0 2 -8", rotation: "0 0 0", link: "/galeria", isSceneLink: false },
  { text: "PISO PINTADO DE BLANCO", position: "-5 -1 -7", rotation: "0 20 0" },
  { text: "11MTS DE TIRO DE CÁMARA", position: "5 -1 -7", rotation: "0 -20 0" },
  { text: "MONTACARGA", position: "-7 0 -4", rotation: "0 60 0" },
  { text: "COMEDOR", position: "7 0 -4", rotation: "0 -60 0", link: "/contacto", isSceneLink: false },
  { text: "INFINITO BLANCO 6M X 3M", position: "0 -0.5 -9", rotation: "0 0 0" },
];

const Viewer360Gallery = ({ 
  imageSrc, 
  secondImageSrc,
  thirdImageSrc,
  fourthImageSrc,
  height = "100vh",
  mobileHeight = "100vh",
}: Viewer360GalleryProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentScene, setCurrentScene] = useState(1);
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
      const scenes = [imageSrc, secondImageSrc, thirdImageSrc, fourthImageSrc].filter(Boolean);
      const activeImage = scenes[currentScene - 1] || imageSrc;

      // Generate 3D text entities with click handlers - Poppins Bold style
      const textsHTML = GALLERY_LABELS.map((item, index) => `
        <a-entity 
          position="${item.position}"
          rotation="${item.rotation || '0 0 0'}"
          class="clickable-label"
          data-link="${item.link || ''}"
          data-scene-link="${item.isSceneLink || false}"
          data-index="${index}"
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
            font="https://cdn.aframe.io/fonts/Roboto-msdf.json"
            width="4"
            anchor="center"
            baseline="center"
            font-weight="bold"
          ></a-text>
          ${item.link ? `
          <a-text 
            value="→" 
            position="1.8 0 0.02"
            color="#FFFFFF"
            scale="2.5 2.5 2.5"
            align="center"
          ></a-text>
          ` : ''}
        </a-entity>
      `).join('');

      // 3D Toggle button immersed in the scene
      const toggleButtonHTML = `
        <a-entity position="0 -2.5 -5" class="clickable-toggle">
          <a-plane 
            width="3.5" 
            height="0.6" 
            color="#1a1a1a" 
            opacity="0.9"
            class="toggle-btn"
          ></a-plane>
          <a-text 
            value="${currentScene === 1 ? '→ VER OTRA VISTA' : '← VOLVER A INICIO'}"
            position="0 0 0.01"
            color="#FFFFFF"
            scale="2.5 2.5 2.5"
            align="center"
            font-weight="bold"
            width="4"
          ></a-text>
        </a-entity>
      `;

      // FOV 70 = vista subjetiva normal, más natural
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
          <a-camera look-controls="reverseMouseDrag: true; touchEnabled: true" fov="70" position="0 1.6 0">
            <a-cursor color="#FFFFFF" opacity="0.6" fuse="true" fuse-timeout="1200" raycaster="objects: .clickable-label, .clickable-toggle"></a-cursor>
          </a-camera>
        </a-scene>
      `;

      if (sceneContainer) {
        sceneContainer.innerHTML = sceneHTML;

        // Add click listeners after scene is created
        setTimeout(() => {
          const scene = sceneContainer.querySelector('a-scene');
          if (scene) {
            // Toggle button click
            const toggleEntity = scene.querySelector('.clickable-toggle');
            if (toggleEntity) {
              toggleEntity.addEventListener('click', () => {
                setCurrentScene(prev => prev === 1 ? 2 : 1);
              });
            }

            // Label clicks for navigation
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
  }, [currentScene, height, mobileHeight, isMobile, imageSrc, secondImageSrc, thirdImageSrc, fourthImageSrc]);

  const handleToggleScene = () => {
    setCurrentScene(prev => prev === 1 ? 2 : 1);
  };

  const openInNewWindow = () => {
    const scenes = [imageSrc, secondImageSrc, thirdImageSrc, fourthImageSrc].filter(Boolean);
    const activeImage = scenes[currentScene - 1] || imageSrc;
    
    // Generate labels HTML for fullscreen
    const textsHTML = GALLERY_LABELS.map((item, index) => `
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

    const fullHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Tour 360° - Galería ALA NORTE</title>
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
      border-radius: 0;
      cursor: pointer;
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .controls button:hover {
      background: rgba(30,30,30,1);
    }
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
    <button onclick="toggleImage()">Cambiar Vista</button>
    <button onclick="openInspector()">Inspector</button>
  </div>
  <a-scene 
    vr-mode-ui="enabled: true"
    inspector="url: https://cdn.jsdelivr.net/gh/aframevr/aframe-inspector@master/dist/aframe-inspector.min.js"
  >
    <a-sky id="sky" src="${activeImage}" rotation="0 -30 0" scale="-1 1 1"></a-sky>
    ${textsHTML}
    <a-camera look-controls="reverseMouseDrag: true; touchEnabled: true" fov="70" position="0 1.6 0">
      <a-cursor color="#FFFFFF" opacity="0.6" fuse="true" fuse-timeout="1200" raycaster="objects: .clickable-label"></a-cursor>
    </a-camera>
  </a-scene>
  <script>
    const images = ${JSON.stringify(scenes)};
    let currentIdx = ${currentScene - 1};
    
    function toggleImage() {
      currentIdx = (currentIdx + 1) % images.length;
      document.getElementById('sky').setAttribute('src', images[currentIdx]);
    }
    
    function openInspector() {
      const scene = document.querySelector('a-scene');
      if (scene && scene.components && scene.components.inspector) {
        scene.components.inspector.openInspector();
      }
    }

    // Handle label clicks
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
      
      {/* Control buttons overlaid - minimal UI */}
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

      {/* Fallback toggle button */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <Button 
          onClick={handleToggleScene}
          variant="default"
          size="lg"
          className="shadow-lg backdrop-blur-sm bg-black text-white font-heading font-bold uppercase tracking-wider hover:bg-black/90"
        >
          {currentScene === 1 ? "→ Ver otra vista" : "← Volver a inicio"}
        </Button>
      </div>
    </div>
  );
};

export default Viewer360Gallery;
