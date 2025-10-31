import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll al header en cada cambio de ruta
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
};
