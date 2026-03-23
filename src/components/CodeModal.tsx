import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface CodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
}

export function CodeModal({ open, onOpenChange, code }: CodeModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-primary">
            Code Rapier 3D
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="absolute top-2 right-2 z-10 font-mono text-xs"
          >
            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            {copied ? "Copié" : "Copier"}
          </Button>
          <pre className="rounded-lg bg-background border border-border p-4 overflow-auto max-h-[60vh] text-xs font-mono text-foreground/90">
            {code}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
