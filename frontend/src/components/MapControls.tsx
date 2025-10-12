import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Layers } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onStyleChange: (style: string) => void;
  currentStyle: string;
}

const mapStyles = [
  { value: "streets-v12", label: "Streets" },
  { value: "light-v11", label: "Light" },
  { value: "dark-v11", label: "Dark" },
  { value: "satellite-v9", label: "Satellite" },
  { value: "satellite-streets-v12", label: "Satellite Streets" },
];

export function MapControls({
  onZoomIn,
  onZoomOut,
  onStyleChange,
  currentStyle,
}: MapControlsProps) {
  const currentStyleLabel =
    mapStyles.find((s) => s.value === currentStyle)?.label || "Streets";

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      <Button
        variant="secondary"
        size="icon"
        onClick={onZoomIn}
        className="shadow-lg"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={onZoomOut}
        className="shadow-lg"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="shadow-lg">
            <Layers className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {mapStyles.map((style) => (
            <DropdownMenuItem
              key={style.value}
              onClick={() => onStyleChange(style.value)}
              className={currentStyle === style.value ? "bg-accent" : ""}
            >
              {style.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
