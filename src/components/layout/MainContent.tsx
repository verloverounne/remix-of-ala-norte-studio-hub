import { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
}

export const MainContent = ({ children }: MainContentProps) => {
  return (
    <main className="max-w-screen-lg mx-auto">
      {children}
    </main>
  );
};
