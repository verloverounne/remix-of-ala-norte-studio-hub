import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface HeaderVisibilityContextType {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  isHovering: boolean;
  setIsHovering: (hovering: boolean) => void;
}

const HeaderVisibilityContext = createContext<HeaderVisibilityContextType | undefined>(undefined);

export const HeaderVisibilityProvider = ({ children }: { children: ReactNode }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const location = useLocation();

  // Auto-hide header after 3 seconds on page load/navigation
  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <HeaderVisibilityContext.Provider value={{ isVisible, setIsVisible, isHovering, setIsHovering }}>
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
