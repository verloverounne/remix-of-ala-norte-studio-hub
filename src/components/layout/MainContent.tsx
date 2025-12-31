import { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
}

export const MainContent = ({ children }: MainContentProps) => {
  return (
    <main>
      {children}
    </main>
  );
};
