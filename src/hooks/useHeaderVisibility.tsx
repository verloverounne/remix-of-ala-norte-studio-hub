import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface HeaderVisibilityContextType {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  isHovering: boolean;
  setIsHovering: (hovering: boolean) => void;
  isMobile: boolean;
}

const HeaderVisibilityContext = createContext<HeaderVisibilityContextType | undefined>(undefined);

export const HeaderVisibilityProvider = ({ children }: { children: ReactNode }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Detect mobile/touch devices
  useEffect(() => {
    const checkMobile = () => {
      // Check for touch capability and screen width
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(isTouchDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-hide header after 3 seconds on page load/navigation (only on desktop)
  useEffect(() => {
    setIsVisible(true);
    
    // Don't auto-hide on mobile
    if (isMobile) return;
    
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [location.pathname, isMobile]);

  return (
    <HeaderVisibilityContext.Provider value={{ isVisible, setIsVisible, isHovering, setIsHovering, isMobile }}>
      {children}
    </HeaderVisibilityContext.Provider>
  );
};

export const useHeaderVisibility = () => {
  const context = useContext(HeaderVisibilityContext);
  if (context === undefined) {
    throw new Error("useHeaderVisibility must be used within a HeaderVisibilityProvider");
  }
  return context;
};
