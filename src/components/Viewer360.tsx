import { useEffect, useRef } from "react";

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
}

const Viewer360 = ({ imageSrc, height = "1000px" }: Viewer360Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

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

      const sceneHTML = `
        <a-scene 
          embedded 
          style="width: 100%; height: ${height};"
          vr-mode-ui="enabled: true"
          loading-screen="enabled: true"
        >
          <a-sky src="${imageSrc}" rotation="0 -30 0" scale="-1 1 1."></a-sky>
          <a-camera look-controls="reverseMouseDrag: true; touchEnabled: true" fov="90"></a-camera>
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
        className="w-full overflow-hidden rounded-lg border border-foreground"
        style={{ height, width: "100%" }}
      >
        <div className="a-scene-container w-full h-full" style={{ height }} />
      </div>
    </div>
  );
};

export default Viewer360;
