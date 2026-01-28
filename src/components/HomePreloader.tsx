import { useEffect, useState, useCallback } from "react";
import navBarLogo from "@/assets/navBarLogo.png";

interface HomePreloaderProps {
  progress: number;
  isComplete: boolean;
}

export const HomePreloader = ({ progress, isComplete }: HomePreloaderProps) => {
  const [rotation, setRotation] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Compass animation - random rotation between -15° and +15°
  useEffect(() => {
    const animate = () => {
      const randomAngle = Math.random() * 30 - 15; // -15 to +15
      setRotation(randomAngle);
    };

    // Initial rotation
    animate();

    // Random interval between 800-1200ms for natural feel
    const getRandomInterval = () => Math.random() * 400 + 800;
    
    let timeoutId: NodeJS.Timeout;
    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        animate();
        scheduleNext();
      }, getRandomInterval());
    };
    
    scheduleNext();

    return () => clearTimeout(timeoutId);
  }, []);

  // Handle exit animation when complete
  useEffect(() => {
    if (isComplete) {
      setIsExiting(true);
    }
  }, [isComplete]);

  // SVG circle progress calculations
  const size = 200;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  if (isExiting) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-500 opacity-0 pointer-events-none">
        {/* Empty during exit */}
      </div>
    );
  }

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-500 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative flex items-center justify-center">
        {/* SVG Progress Circle */}
        <svg
          width={size}
          height={size}
          className="absolute transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-300 ease-out"
          />
        </svg>

        {/* Logo with compass animation */}
        <div
          className="relative z-10"
          style={{
            perspective: "1000px",
          }}
        >
          <img
            src={navBarLogo}
            alt="Ala Norte"
            className="w-24 h-auto"
            style={{
              transform: `rotateY(${rotation}deg)`,
              transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              transformStyle: "preserve-3d",
            }}
          />
        </div>
      </div>

      {/* Progress percentage */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <span className="font-heading text-sm text-muted-foreground tracking-widest">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};
