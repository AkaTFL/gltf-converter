import { Button } from "@/components/ui/button";
import { Triangle, Eye, EyeOff, Code, Loader2 } from "lucide-react";
import type { HitboxData } from "@/types/hitbox";

interface ControlPanelProps {
  fileName: string | null;
  onGenerate: () => void;
  generating: boolean;
  hitboxes: HitboxData[];
  showModel: boolean;
  showHitboxes: boolean;
  onToggleModel: () => void;
  onToggleHitboxes: () => void;
  onExportCode: () => void;
  onToggleHitboxVisibility: (index: number) => void;
}

export function ControlPanel({
  fileName,
  onGenerate,
  generating,
  hitboxes,
  showModel,
  showHitboxes,
  onToggleModel,
  onToggleHitboxes,
  onExportCode,
  onToggleHitboxVisibility,
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

      {/* Trimesh type info */}
      <div className="rounded-lg bg-card border border-border p-4">
        <div className="flex items-center gap-2">
          <Triangle className="h-4 w-4 text-primary" />
          <p className="text-xs text-foreground font-mono uppercase tracking-wider">
            Trimesh (Triangle Mesh)
          </p>
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
              <div key={i} className="flex items-center justify-between gap-2 text-xs font-mono">
                <span className="text-foreground truncate mr-2">{hb.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onToggleHitboxVisibility(i)}
                    className={`rounded border px-2 py-1 transition-all ${
                      hb.visible !== false
                        ? "border-accent text-accent"
                        : "border-border text-muted-foreground"
                    }`}
                    title={hb.visible !== false ? "Masquer" : "Afficher"}
                  >
                    {hb.visible !== false ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </button>
                  <span className="text-primary/70">{hb.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export code */}
      {hitboxes.length > 0 && (
        <Button variant="outline" onClick={onExportCode} className="w-full font-mono text-xs uppercase tracking-wider">
          <Code className="h-4 w-4 mr-2" />
          Exporter Colliders Rapier
        </Button>
      )}
    </div>
  );
}
