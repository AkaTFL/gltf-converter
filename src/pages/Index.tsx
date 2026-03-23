import { useState, useCallback, useRef, useEffect } from "react";
import { UploadZone } from "@/components/UploadZone";
import { Scene } from "@/components/Scene";
import { ControlPanel } from "@/components/ControlPanel";
import { CodeModal } from "@/components/CodeModal";
import { generateHitboxes, hitboxToRapierCode } from "@/lib/hitbox-generator";
import type { HitboxData, HitboxType } from "@/types/hitbox";
import { Boxes } from "lucide-react";

const Index = () => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [hitboxType, setHitboxType] = useState<HitboxType>("box");
  const [hitboxes, setHitboxes] = useState<HitboxData[]>([]);
  const [generating, setGenerating] = useState(false);
  const [showModel, setShowModel] = useState(true);
  const [showHitboxes, setShowHitboxes] = useState(true);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const cleanupRef = useRef<(() => void) | null>(null);

  const handleFileLoad = useCallback((url: string, name: string, cleanup: () => void) => {
    cleanupRef.current?.();
    cleanupRef.current = cleanup;
    setFileUrl(url);
    setFileName(name);
    setHitboxes([]);
  }, []);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!fileUrl) return;
    setGenerating(true);
    try {
      const result = await generateHitboxes(fileUrl, hitboxType);
      setHitboxes(result);
      setShowHitboxes(true);
    } catch (err) {
      console.error("Hitbox generation failed:", err);
    }
    setGenerating(false);
  }, [fileUrl, hitboxType]);

  const handleExportCode = useCallback(() => {
    const code = hitboxToRapierCode(hitboxes);
    setGeneratedCode(code);
    setCodeModalOpen(true);
  }, [hitboxes]);

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border px-6 py-3">
        <Boxes className="h-6 w-6 text-primary" />
        <h1 className="font-display text-xl font-bold tracking-tight">
          <span className="text-primary text-glow">Hitbox</span>
          <span className="text-foreground">Gen</span>
        </h1>
        <span className="ml-2 rounded bg-secondary px-2 py-0.5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          Rapier 3D
        </span>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* 3D Viewport */}
        <div className="flex-1 relative">
          {fileUrl ? (
            <Scene
              fileUrl={fileUrl}
              hitboxes={hitboxes}
              showModel={showModel}
              showHitboxes={showHitboxes}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-12">
              <div className="w-full max-w-lg">
                <UploadZone onFileLoad={handleFileLoad} />
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        {fileUrl && (
          <aside className="w-72 shrink-0 border-l border-border bg-card/50 p-5 overflow-y-auto">
            <ControlPanel
              fileName={fileName}
              hitboxType={hitboxType}
              onTypeChange={setHitboxType}
              onGenerate={handleGenerate}
              generating={generating}
              hitboxes={hitboxes}
              showModel={showModel}
              showHitboxes={showHitboxes}
              onToggleModel={() => setShowModel((v) => !v)}
              onToggleHitboxes={() => setShowHitboxes((v) => !v)}
              onExportCode={handleExportCode}
            />

            {/* Re-upload */}
            <button
              onClick={() => {
                cleanupRef.current?.();
                cleanupRef.current = null;
                setFileUrl(null);
                setFileName(null);
                setHitboxes([]);
              }}
              className="mt-6 w-full rounded-md border border-border px-3 py-2 text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            >
              Charger un autre fichier
            </button>
          </aside>
        )}
      </div>

      <CodeModal
        open={codeModalOpen}
        onOpenChange={setCodeModalOpen}
        code={generatedCode}
      />
    </div>
  );
};

export default Index;
