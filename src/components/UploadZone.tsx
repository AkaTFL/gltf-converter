import { useCallback, useState } from "react";
import { Upload } from "lucide-react";

interface UploadZoneProps {
  onFileLoad: (url: string, fileName: string) => void;
}

export function UploadZone({ onFileLoad }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.match(/\.(gltf|glb)$/i)) return;
      const url = URL.createObjectURL(file);
      onFileLoad(url, file.name);
    },
    [onFileLoad]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
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
        rounded-lg border-2 border-dashed p-12 transition-all cursor-pointer
        ${isDragging
          ? "border-primary bg-primary/5 glow-primary"
          : "border-muted-foreground/30 hover:border-primary/50"
        }
      `}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".gltf,.glb";
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) handleFile(file);
        };
        input.click();
      }}
    >
      <div className="rounded-full bg-secondary p-4">
        <Upload className="h-8 w-8 text-primary" />
      </div>
      <div className="text-center">
        <p className="font-display text-lg font-semibold text-foreground">
          Déposer un fichier GLTF / GLB
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          ou cliquer pour parcourir
        </p>
      </div>
    </div>
  );
}
