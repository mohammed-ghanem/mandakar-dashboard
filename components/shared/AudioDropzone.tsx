"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Music2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AudioDropzoneLabels = {
  hint?: string;
  browse?: string;
  currentAudio?: string;
  noNewUpload?: string;
  loading?: string;
  formatsNote?: string;
};

type AudioDropzoneProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  /** Called when trash is pressed (new or existing audio). Prefer over clearing file only. */
  onRemove?: () => void | Promise<void>;
  existingAudioUrl?: string;
  className?: string;
  accept?: string;
  showRemoveButton?: boolean;
  removing?: boolean;
  labels?: AudioDropzoneLabels;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAudioFile(file: File) {
  return (
    file.type.startsWith("audio/") ||
    /\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(file.name)
  );
}

export default function AudioDropzone({
  file,
  onFileChange,
  onRemove,
  existingAudioUrl,
  className = "",
  accept = "audio/*",
  showRemoveButton = true,
  removing = false,
  labels,
}: AudioDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    return existingAudioUrl || "";
  }, [file, existingAudioUrl]);

  useEffect(() => {
    return () => {
      if (file && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [file, previewUrl]);

  const handlePick = (picked: File | null) => {
    if (!picked) return;
    if (!isAudioFile(picked)) return;

    setIsLoading(true);
    setLoadProgress(0);

    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      setLoadProgress(percent);
    };
    reader.onload = () => {
      setLoadProgress(100);
      onFileChange(picked);
      window.setTimeout(() => {
        setIsLoading(false);
        setLoadProgress(0);
      }, 250);
    };
    reader.onerror = () => {
      setIsLoading(false);
      setLoadProgress(0);
      onFileChange(picked);
    };
    reader.readAsArrayBuffer(picked);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          handlePick(e.target.files?.[0] ?? null);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />

      <div
        className={cn(
          "rounded-xl border-2 border-dashed p-5 text-center transition-colors",
          isDragging
            ? "border-emerald-600 bg-emerald-50"
            : "border-slate-300 bg-background hover:border-emerald-500",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handlePick(e.dataTransfer.files?.[0] ?? null);
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <Music2 className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {labels?.hint ?? "Drag and drop audio here or click to browse"}
          </p>
          {labels?.formatsNote ? (
            <p className="text-xs text-muted-foreground">{labels.formatsNote}</p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="mt-1 rounded-xl"
            onClick={() => inputRef.current?.click()}
          >
            {labels?.browse ?? "Choose audio"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 rounded-xl border border-emerald-200/70 bg-emerald-50/40 px-3 py-3">
          <div className="flex items-center justify-between text-xs text-emerald-900">
            <span>{labels?.loading ?? "Loading audio..."}</span>
            <span>{loadProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-150"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      ) : null}

      {previewUrl && !isLoading ? (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <Music2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <p className="truncate text-sm font-medium">
                {file
                  ? file.name
                  : labels?.currentAudio ?? "Current audio file"}
              </p>
              <p className="text-xs text-muted-foreground">
                {file
                  ? formatSize(file.size)
                  : labels?.noNewUpload ?? "No new upload selected"}
              </p>
            </div>
            <audio controls className="w-full max-w-md" src={previewUrl} />
          </div>
          {showRemoveButton ? (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="rounded-xl shrink-0 self-end sm:self-center"
              disabled={removing}
              onClick={() => {
                void (async () => {
                  if (onRemove) {
                    await onRemove();
                  } else {
                    onFileChange(null);
                  }
                  if (inputRef.current) inputRef.current.value = "";
                })();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
