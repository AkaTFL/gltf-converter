import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { analyzeUploadedModel, prepareUploadedModel } from "@/lib/model-upload";

interface UploadZoneProps {
  onFileLoad: (url: string, fileName: string, cleanup: () => void) => void;
}

export function UploadZone({ onFileLoad }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const analysis = await analyzeUploadedModel(files);
      if (!analysis) {
        setErrorMessage("Aucun fichier .gltf ou .glb detecte.");
        return;
      }

      if (analysis.modelType === "gltf" && analysis.missingAssets.length > 0) {
        const preview = analysis.missingAssets.slice(0, 3).join(", ");
        const suffix = analysis.missingAssets.length > 3 ? ", ..." : "";
        setErrorMessage(`GLTF incomplet: fichiers manquants (${preview}${suffix}). Importez le dossier complet.`);
        return;
      }

      const uploaded = await prepareUploadedModel(files);
      if (!uploaded) {
        setErrorMessage("Impossible de charger ce modele.");
        return;
      }

      setErrorMessage(null);
      onFileLoad(uploaded.url, uploaded.fileName, uploaded.cleanup);
    },
    [onFileLoad]
  );

  const openFilesPicker = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".gltf,.glb,.bin,.png,.jpg,.jpeg,.webp,.ktx2";
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files ?? []);
      if (files.length > 0) {
        void handleFiles(files);
      }
    };
    input.click();
  }, [handleFiles]);

  const openFolderPicker = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.setAttribute("webkitdirectory", "");
    input.setAttribute("directory", "");
    input.accept = ".gltf,.glb,.bin,.png,.jpg,.jpeg,.webp,.ktx2";
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files ?? []);
      if (files.length > 0) {
        void handleFiles(files);
      }
    };
    input.click();
  }, [handleFiles]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        void handleFiles(files);
      }
    },
    [handleFiles]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={`
        relative flex flex-col items-center justify-center gap-4
        rounded-lg border-2 border-dashed p-12 transition-all
        ${isDragging
          ? "border-primary bg-primary/5 glow-primary"
          : "border-muted-foreground/30 hover:border-primary/50"
        }
      `}
    >
      <div className="rounded-full bg-secondary p-4">
        <Upload className="h-8 w-8 text-primary" />
      </div>
      <div className="text-center">
        <p className="font-display text-lg font-semibold text-foreground">
          Déposer un fichier GLTF / GLB
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          GLB: un fichier. GLTF: importer le dossier complet.
        </p>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={openFilesPicker}
          className="rounded-md border border-border px-3 py-2 text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
        >
          Importer des fichiers
        </button>
        <button
          type="button"
          onClick={openFolderPicker}
          className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-mono text-primary hover:bg-primary/20 transition-all"
        >
          Importer un dossier (GLTF)
        </button>
      </div>

      {errorMessage && (
        <p className="mt-1 text-center text-xs text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
