import { ReactNode } from "react";
import { useHeaderVisibility } from "@/hooks/useHeaderVisibility";

interface MainContentProps {
  children: ReactNode;
}

export const MainContent = ({ children }: MainContentProps) => {
  const { isVisible, isHovering } = useHeaderVisibility();
  const headerVisible = isVisible || isHovering;

  return (
    <main 
      className={`transition-[padding-top] duration-300 ${
        headerVisible ? 'pt-16 sm:pt-20' : 'pt-0'
      }`}
    >
      {children}
    </main>
  );
};
