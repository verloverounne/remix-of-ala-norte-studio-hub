import { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
  className?: string;
}

export const MainContent = ({ children, className }: MainContentProps) => {
  return (
    <main className={className}>
      {children}
    </main>
  );
};
