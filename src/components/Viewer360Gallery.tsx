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
  action?: { type: 'view' | 'page'; target: string | number };
}

// View 1 labels - Galería main view (360.jpg)
const VIEW_1_LABELS: Text3DItem[] = [
  { text: "GALERÍA", position: "0 2 -8", rotation: "0 0 0", action: { type: 'view', target: 1 } },
  { text: "COMEDOR", position: "-6 1 -5", rotation: "0 45 0", action: { type: 'view', target: 2 } },
  { text: "SALA DE GRABACIÓN", position: "6 1 -5", rotation: "0 -45 0", action: { type: 'page', target: '/sala-grabacion#view-2' } },
  { text: "ESTUDIO DE POSTPRODUCCIÓN", position: "0 0.5 -7", rotation: "0 0 0", action: { type: 'page', target: '/sala-grabacion#view-1' } },
];

// View 2 labels - Comedor view (361.jpg)
const VIEW_2_LABELS: Text3DItem[] = [
  { text: "GALERÍA", position: "0 2 -8", rotation: "0 0 0", action: { type: 'view', target: 1 } },
  { text: "COMEDOR", position: "-6 1.5 -5", rotation: "0 45 0", action: { type: 'view', target: 2 } },
  { text: "SALA DE GRABACIÓN", position: "6 1 -5", rotation: "0 -45 0", action: { type: 'page', target: '/sala-grabacion#view-2' } },
  { text: "ESTUDIO DE POSTPRODUCCIÓN", position: "0 0.5 -7", rotation: "0 0 0", action: { type: 'page', target: '/sala-grabacion#view-1' } },
];

interface Viewer360GalleryProps {
  imageSrc: string;
  secondImageSrc?: string;
  height?: string;
  mobileHeight?: string;
  initialView?: number;
}

const Viewer360Gallery = ({ 
  imageSrc, 
  secondImageSrc,
  height = "100vh",
  mobileHeight = "100vh",
  initialView = 1,
}: Viewer360GalleryProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentView, setCurrentView] = useState(initialView);
  const [isMobile, setIsMobile] = useState(false);

  // Image sources for each view
  const viewImages = {
    1: imageSrc,
    2: secondImageSrc || imageSrc,
  };

  // Labels for each view
  const viewLabels = {
    1: VIEW_1_LABELS,
    2: VIEW_2_LABELS,
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Check URL hash for initial view
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#view-1') setCurrentView(1);
    else if (hash === '#view-2') setCurrentView(2);
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
      const currentLabels = viewLabels[currentView as keyof typeof viewLabels] || VIEW_1_LABELS;
      const currentImage = viewImages[currentView as keyof typeof viewImages];

      // Generate 3D text entities with click handlers
      const textsHTML = currentLabels.map((item, index) => {
        const hasAction = !!item.action;
        return `
          <a-entity 
            position="${item.position}"
            rotation="${item.rotation || '0 0 0'}"
            class="${hasAction ? 'clickable-label' : ''}"
            data-action-type="${item.action?.type || ''}"
            data-action-target="${item.action?.target || ''}"
          >
            <a-plane 
              width="4.2" 
              height="0.6" 
              color="#000000" 
              opacity="0.85"
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
              font="https://cdn.aframe.io/fonts/Roboto-msdf.json"
            ></a-text>
            ${hasAction ? '<a-text value="→" position="1.9 0 0.02" color="#FFFFFF" scale="2.5 2.5 2.5" align="center"></a-text>' : ''}
          </a-entity>
        `;
      }).join('');

      // FOV 80 = wider view for gallery
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
          <a-camera look-controls="reverseMouseDrag: true; touchEnabled: true" fov="80" position="0 1.6 0">
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
                const actionType = label.getAttribute('data-action-type');
                const actionTarget = label.getAttribute('data-action-target');
                
                if (actionType === 'view') {
                  setCurrentView(parseInt(actionTarget));
                } else if (actionType === 'page') {
                  window.location.href = actionTarget;
                }
              });
              
              // Hover effect - change to primary color
              label.addEventListener('mouseenter', () => {
                const bg = label.querySelector('.label-bg');
                if (bg) {
                  bg.setAttribute('color', '#D4A017');
                  bg.setAttribute('opacity', '1');
                }
              });
              label.addEventListener('mouseleave', () => {
                const bg = label.querySelector('.label-bg');
                if (bg) {
                  bg.setAttribute('color', '#000000');
                  bg.setAttribute('opacity', '0.85');
                }
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
  }, [currentView, height, mobileHeight, isMobile]);

  const openInNewWindow = () => {
    const currentLabels = viewLabels[currentView as keyof typeof viewLabels] || VIEW_1_LABELS;
    const currentImage = viewImages[currentView as keyof typeof viewImages];
    
    const textsHTML = currentLabels.map((item) => {
      const hasAction = !!item.action;
      return `
        <a-entity 
          position="${item.position}"
          rotation="${item.rotation || '0 0 0'}"
          class="${hasAction ? 'clickable-label' : ''}"
          data-action-type="${item.action?.type || ''}"
          data-action-target="${item.action?.target || ''}"
        >
          <a-plane width="4.2" height="0.6" color="#000000" opacity="0.85" class="label-bg"></a-plane>
          <a-text value="${item.text}" position="0 0 0.02" color="#FFFFFF" scale="2 2 2" align="center" width="4" anchor="center" baseline="center"></a-text>
          ${hasAction ? '<a-text value="→" position="1.9 0 0.02" color="#FFFFFF" scale="2.5 2.5 2.5" align="center"></a-text>' : ''}
        </a-entity>
      `;
    }).join('');

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
      cursor: pointer;
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .controls button:hover { background: #D4A017; }
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
  <div class="hint">Arrastra para explorar • Haz clic en los botones para navegar</div>
  <div class="controls">
    <button onclick="toggleView()">Cambiar Vista</button>
    <button onclick="openInspector()">Inspector</button>
  </div>
  <a-scene 
    vr-mode-ui="enabled: true"
    inspector="url: https://cdn.jsdelivr.net/gh/aframevr/aframe-inspector@master/dist/aframe-inspector.min.js"
  >
    <a-sky id="sky" src="${currentImage}" rotation="0 -30 0" scale="-1 1 1"></a-sky>
    ${textsHTML}
    <a-camera look-controls="reverseMouseDrag: true; touchEnabled: true" fov="80" position="0 1.6 0">
      <a-cursor color="#FFFFFF" opacity="0.6" fuse="true" fuse-timeout="1200" raycaster="objects: .clickable-label"></a-cursor>
    </a-camera>
  </a-scene>
  <script>
    const images = ['${viewImages[1]}', '${viewImages[2]}'];
    let currentIdx = ${currentView - 1};
    
    function toggleView() {
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
            const actionType = label.getAttribute('data-action-type');
            const actionTarget = label.getAttribute('data-action-target');
            if (actionType === 'view') {
              currentIdx = parseInt(actionTarget) - 1;
              document.getElementById('sky').setAttribute('src', images[currentIdx]);
            } else if (actionType === 'page') {
              window.location.href = actionTarget;
            }
          });
          
          // Hover effect
          label.addEventListener('mouseenter', () => {
            const bg = label.querySelector('.label-bg');
            if (bg) {
              bg.setAttribute('color', '#D4A017');
              bg.setAttribute('opacity', '1');
            }
          });
          label.addEventListener('mouseleave', () => {
            const bg = label.querySelector('.label-bg');
            if (bg) {
              bg.setAttribute('color', '#000000');
              bg.setAttribute('opacity', '0.85');
            }
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
          className="shadow-lg backdrop-blur-sm bg-black/80 text-white border-0 font-heading font-bold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground"
        >
          <Maximize2 className="h-4 w-4 mr-1" />
          Pantalla Completa
        </Button>
      </div>
      
      {/* View indicator & toggle */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        <Button 
          onClick={() => setCurrentView(1)}
          variant={currentView === 1 ? "default" : "secondary"}
          size="sm"
          className={`shadow-lg font-heading font-bold uppercase tracking-wider ${currentView === 1 ? 'bg-primary text-primary-foreground' : 'bg-black/80 text-white hover:bg-primary hover:text-primary-foreground'}`}
        >
          Galería
        </Button>
        <Button 
          onClick={() => setCurrentView(2)}
          variant={currentView === 2 ? "default" : "secondary"}
          size="sm"
          className={`shadow-lg font-heading font-bold uppercase tracking-wider ${currentView === 2 ? 'bg-primary text-primary-foreground' : 'bg-black/80 text-white hover:bg-primary hover:text-primary-foreground'}`}
        >
          Comedor
        </Button>
      </div>
    </div>
  );
};

export default Viewer360Gallery;
