import { Button } from "@/components/ui/button";
import { Box, Circle, Triangle, Eye, EyeOff, Code, Loader2 } from "lucide-react";
import type { HitboxType, HitboxData } from "@/types/hitbox";

interface ControlPanelProps {
  fileName: string | null;
  hitboxType: HitboxType;
  onTypeChange: (type: HitboxType) => void;
  onGenerate: () => void;
  generating: boolean;
  hitboxes: HitboxData[];
  showModel: boolean;
  showHitboxes: boolean;
  onToggleModel: () => void;
  onToggleHitboxes: () => void;
  onExportCode: () => void;
}

const typeOptions: { type: HitboxType; label: string; icon: React.ReactNode }[] = [
  { type: "box", label: "AABB Box", icon: <Box className="h-4 w-4" /> },
  { type: "sphere", label: "Sphere", icon: <Circle className="h-4 w-4" /> },
  { type: "trimesh", label: "Trimesh", icon: <Triangle className="h-4 w-4" /> },
];

export function ControlPanel({
  fileName,
  hitboxType,
  onTypeChange,
  onGenerate,
  generating,
  hitboxes,
  showModel,
  showHitboxes,
  onToggleModel,
  onToggleHitboxes,
  onExportCode,
}: ControlPanelProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* File info */}
      {fileName && (
        <div className="rounded-lg bg-card border border-border p-4">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">
            Fichier chargé
          </p>
          <p className="font-mono text-sm text-primary truncate">{fileName}</p>
        </div>
      )}

      {/* Hitbox type selector */}
      <div>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-3">
          Type de Hitbox
        </p>
        <div className="flex gap-2">
          {typeOptions.map((opt) => (
            <button
              key={opt.type}
              onClick={() => onTypeChange(opt.type)}
              className={`
                flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-mono transition-all
                ${hitboxType === opt.type
                  ? "border-primary bg-primary/10 text-primary glow-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }
              `}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <Button
        onClick={onGenerate}
        disabled={!fileName || generating}
        className="w-full font-mono uppercase tracking-wider"
      >
        {generating ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : null}
        {generating ? "Génération..." : "Générer Hitbox"}
      </Button>

      {/* Visibility toggles */}
      {hitboxes.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={onToggleModel}
            className={`flex-1 flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-mono transition-all ${
              showModel ? "border-primary/50 text-primary" : "border-border text-muted-foreground"
            }`}
          >
            {showModel ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            Modèle
          </button>
          <button
            onClick={onToggleHitboxes}
            className={`flex-1 flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-mono transition-all ${
              showHitboxes ? "border-accent text-accent" : "border-border text-muted-foreground"
            }`}
          >
            {showHitboxes ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            Hitbox
          </button>
        </div>
      )}

      {/* Stats */}
      {hitboxes.length > 0 && (
        <div className="rounded-lg bg-card border border-border p-4">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-3">
            Colliders générés
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {hitboxes.map((hb, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-mono">
                <span className="text-foreground truncate mr-2">{hb.name}</span>
                <span className="text-primary/70 shrink-0">{hb.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export code */}
      {hitboxes.length > 0 && (
        <Button variant="outline" onClick={onExportCode} className="w-full font-mono text-xs uppercase tracking-wider">
          <Code className="h-4 w-4 mr-2" />
          Exporter Code Rapier
        </Button>
      )}
    </div>
  );
}
