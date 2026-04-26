"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Download,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  RotateCcw,
  Trash2,
  AlertCircle,
  Table,
  Presentation,
  BookOpen,
  Type,
  PenTool,
  Archive,
  Code,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CompressionItem } from "@/hooks/use-compressor";
import { type FileCategory, getCategoryLabel } from "@/lib/formats";

interface CompressionCardProps {
  item: CompressionItem;
  onChangeLevel: (level: number) => void;
  onCompress: (level?: number) => void;
  onRemove: () => void;
}

const categoryIcon: Record<FileCategory, React.ReactNode> = {
  image: <FileImage className="h-5 w-5" />,
  video: <FileVideo className="h-5 w-5" />,
  audio: <FileAudio className="h-5 w-5" />,
  document: <FileText className="h-5 w-5" />,
  spreadsheet: <Table className="h-5 w-5" />,
  presentation: <Presentation className="h-5 w-5" />,
  ebook: <BookOpen className="h-5 w-5" />,
  font: <Type className="h-5 w-5" />,
  vector: <PenTool className="h-5 w-5" />,
  archive: <Archive className="h-5 w-5" />,
  code: <Code className="h-5 w-5" />,
};

const categoryColor: Record<FileCategory, string> = {
  image: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400",
  video: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  audio: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  document: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  spreadsheet: "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
  presentation: "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400",
  ebook: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
  font: "bg-pink-500/10 text-pink-600 border-pink-500/20 dark:text-pink-400",
  vector: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400",
  archive: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400",
  code: "bg-teal-500/10 text-teal-600 border-teal-500/20 dark:text-teal-400",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function strategyLabel(s: CompressionItem["strategy"]): string {
  switch (s) {
    case "image-reencode": return "Re-encode → WebP";
    case "video-crf":      return "H.264 / CRF";
    case "audio-bitrate":  return "MP3 / bitrate";
    case "text-minify":    return "Minify";
    case "deflate-zip":    return "ZIP / DEFLATE";
  }
}

function levelHint(level: number): string {
  if (level <= 25) return "High quality";
  if (level <= 55) return "Balanced";
  if (level <= 80) return "Small file";
  return "Smallest";
}

export function CompressionCard({
  item,
  onChangeLevel,
  onCompress,
  onRemove,
}: CompressionCardProps) {
  const isCompressing = item.status === "compressing";
  const isError = item.status === "error";

  const lastUrlRef = useRef<string | null>(item.outputUrl);
  if (item.outputUrl !== null) lastUrlRef.current = item.outputUrl;
  const displayUrl = item.outputUrl ?? lastUrlRef.current;

  // Debounced auto-recompress on slider change
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleLevelChange = useCallback(
    (lv: number) => {
      onChangeLevel(lv);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      // Only auto-recompress for cheap operations (image / text). Video/audio
      // are expensive — user explicitly clicks Compress.
      if (item.strategy === "image-reencode" || item.strategy === "text-minify") {
        debounceRef.current = setTimeout(() => onCompress(lv), 500);
      }
    },
    [onChangeLevel, onCompress, item.strategy],
  );

  const previewSize =
    item.outputSize ??
    (item.strategy === "image-reencode" ? item.estimatedSize : null);
  const savingsPct =
    previewSize != null && item.file.size > 0
      ? Math.round((1 - previewSize / item.file.size) * 100)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="group relative rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-border"
    >
      <div className="flex gap-4">
        {/* ── Left: source + slider + action ── */}
        <div className={`min-w-0 ${displayUrl ? "w-1/2" : "flex-1"}`}>
          <div className="flex items-start gap-3">
            {item.thumbnailUrl ? (
              <img
                src={item.thumbnailUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-lg border border-border/60 object-cover"
              />
            ) : (
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${categoryColor[item.category]}`}
              >
                {categoryIcon[item.category]}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{item.file.name}</p>
                <Badge
                  variant="outline"
                  className="shrink-0 text-[10px] uppercase tracking-wider"
                >
                  {item.sourceExtension}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatFileSize(item.file.size)} · {getCategoryLabel(item.category)} · {strategyLabel(item.strategy)}
              </p>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={onRemove}
              className="h-8 w-8 shrink-0 cursor-pointer text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Compression slider */}
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Compression</span>
              <span className="tabular-nums">
                {item.level}% · {levelHint(item.level)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={item.level}
              disabled={isCompressing}
              onChange={(e) => handleLevelChange(Number(e.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-muted accent-violet-500 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500"
            />
          </div>

          {/* Action button (manual trigger for video/audio/zip) */}
          {(item.strategy === "video-crf" ||
            item.strategy === "audio-bitrate" ||
            item.strategy === "deflate-zip") && (
            <div className="mt-3">
              <Button
                size="sm"
                onClick={() => onCompress(item.level)}
                disabled={isCompressing}
                className="h-8 w-full cursor-pointer gap-1.5 text-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {isCompressing
                  ? `Compressing… ${item.progress}%`
                  : item.outputUrl
                    ? "Recompress"
                    : "Compress"}
              </Button>
            </div>
          )}

          {/* Already-compressed hint */}
          {item.alreadyCompressedHint && !displayUrl && (
            <p className="mt-3 flex items-start gap-1.5 text-[11px] text-muted-foreground">
              <Info className="h-3 w-3 shrink-0 translate-y-0.5" />
              <span>
                {item.sourceExtension.toUpperCase()} files are already compressed —
                expect modest savings.
              </span>
            </p>
          )}

          {/* Error */}
          {isError && (
            <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
              <p className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="h-3.5 w-3.5" />
                {item.error}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCompress()}
                className="h-7 gap-1.5 text-xs"
              >
                <RotateCcw className="h-3 w-3" /> Retry
              </Button>
            </div>
          )}
        </div>

        {/* ── Right: result ── */}
        {displayUrl && (
          <div className="flex w-1/2 flex-col gap-3 border-l border-border/40 pl-4">
            <div className="flex items-start gap-3">
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-lg border border-border/60 object-cover"
                />
              ) : (
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${categoryColor[item.category]}`}
                >
                  {categoryIcon[item.category]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">
                    {item.outputName ?? item.file.name}
                  </p>
                  {savingsPct != null && (
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-[10px] tabular-nums ${
                        savingsPct > 0
                          ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                          : "border-amber-500/40 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {savingsPct > 0 ? `−${savingsPct}%` : `+${Math.abs(savingsPct)}%`}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <span className="inline-block min-w-[60px]">
                    {item.estimating || isCompressing ? (
                      <span className="inline-block h-3 w-12 animate-pulse rounded bg-muted align-middle" />
                    ) : previewSize != null ? (
                      formatFileSize(previewSize)
                    ) : (
                      <span className="inline-block h-3 w-12 animate-pulse rounded bg-muted align-middle" />
                    )}
                  </span>
                  {" · from "}
                  {formatFileSize(item.file.size)}
                </p>
              </div>
            </div>

            <a
              href={item.outputUrl ?? undefined}
              download={item.outputName ?? item.file.name}
              aria-disabled={!item.outputUrl}
              onClick={(e) => {
                if (!item.outputUrl) e.preventDefault();
              }}
              className={`mt-auto inline-flex h-8 w-fit items-center gap-1.5 self-end rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors ${
                item.outputUrl
                  ? "cursor-pointer hover:bg-primary/80"
                  : "pointer-events-none opacity-50"
              }`}
            >
              <Download className="h-3.5 w-3.5" /> Download
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
