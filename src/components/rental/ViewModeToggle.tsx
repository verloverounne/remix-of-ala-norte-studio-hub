import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ViewMode = "cards" | "list";

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ViewModeToggle = ({ viewMode, onViewModeChange }: ViewModeToggleProps) => {
  const baseClass = "h-8 w-8 p-0 rounded-sm transition-colors";
  const activeClass = "bg-primary text-primary-foreground";
  const inactiveClass = "bg-black text-white hover:bg-foreground hover:text-background";

  return (
    <div className="flex items-center border border-foreground/20 rounded-sm overflow-hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange("cards")}
        className={cn(baseClass, viewMode === "cards" ? activeClass : inactiveClass)}
        aria-label="Vista de tarjetas"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange("list")}
        className={cn(baseClass, viewMode === "list" ? activeClass : inactiveClass)}
        aria-label="Vista de lista"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ViewModeToggle;

