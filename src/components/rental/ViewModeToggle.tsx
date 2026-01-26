import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ViewMode = "cards" | "list";

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ViewModeToggle = ({ viewMode, onViewModeChange }: ViewModeToggleProps) => {
  return (
    <div className="flex items-center border border-foreground/20 rounded-none">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange("cards")}
        className={cn(
          "h-8 w-8 p-0 rounded-none",
          viewMode === "cards" && "bg-primary text-primary-foreground"
        )}
        aria-label="Vista de tarjetas"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange("list")}
        className={cn(
          "h-8 w-8 p-0 rounded-none",
          viewMode === "list" && "bg-primary text-primary-foreground"
        )}
        aria-label="Vista de lista"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ViewModeToggle;
