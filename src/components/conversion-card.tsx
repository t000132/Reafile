"use client";

import { motion } from "framer-motion";
import {
  Download,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  RotateCcw,
  Trash2,
  Check,
  AlertCircle,
  Table,
  Presentation,
  BookOpen,
  Type,
  PenTool,
  Archive,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { ConversionItem } from "@/hooks/use-converter";
import { type FileCategory, getCategoryLabel } from "@/lib/formats";

interface ConversionCardProps {
  item: ConversionItem;
  onChangeFormat: (format: string) => void;
  onChangeQuality: (quality: number) => void;
  onConvert: () => void;
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

export function ConversionCard({
  item,
  onChangeFormat,
  onChangeQuality,
  onConvert,
  onRemove,
}: ConversionCardProps) {
  const isConverting = item.status === "converting";
  const isDone = item.status === "done";
  const isError = item.status === "error";

  const handleFormatClick = (format: string) => {
    if (isConverting || isDone) return;
    onChangeFormat(format);
    // Auto-convert after a brief delay to allow state update
    setTimeout(() => onConvert(), 50);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="group relative rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-border"
    >
      {/* Header: Icon + Info + Remove */}
      <div className="flex items-start gap-3">
        {/* Icon / Thumbnail */}
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

        {/* File Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">
              {item.file.name}
            </p>
            <Badge
              variant="outline"
              className="shrink-0 text-[10px] uppercase tracking-wider"
            >
              {item.sourceExtension}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatFileSize(item.file.size)} · {getCategoryLabel(item.category)}
          </p>
        </div>

        {/* Remove button */}
        <Button
          size="icon"
          variant="ghost"
          onClick={onRemove}
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Format Chips */}
      {!isDone && !isConverting && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.availableFormats.map((format) => (
            <button
              key={format.value}
              onClick={() => handleFormatClick(format.value)}
              disabled={format.value === item.sourceExtension}
              className={`cursor-pointer rounded-lg border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide transition-all ${
                format.value === item.sourceExtension
                  ? "cursor-not-allowed border-border/40 bg-muted/40 text-muted-foreground/40"
                  : "border-border/60 bg-muted/30 text-foreground hover:border-violet-400/60 hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400"
              }`}
            >
              {format.label}
            </button>
          ))}
        </div>
      )}

      {/* Quality slider for image / video / audio */}
      {!isDone &&
        !isConverting &&
        (item.category === "image" ||
          item.category === "video" ||
          item.category === "audio") && (
          <div className="mt-3 flex items-center gap-2 border-t border-border/40 pt-3">
            <label className="text-[11px] text-muted-foreground whitespace-nowrap">
              Quality
            </label>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={Math.round(item.quality * 100)}
              onChange={(e) =>
                onChangeQuality(Number(e.target.value) / 100)
              }
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-violet-500 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500"
            />
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {Math.round(item.quality * 100)}%
            </span>
          </div>
        )}

      {/* Progress */}
      {isConverting && (
        <div className="mt-3 border-t border-border/40 pt-3">
          <Progress value={item.progress} className="h-1.5" />
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Converting to {item.targetFormat.toUpperCase()}… {item.progress}%
          </p>
        </div>
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
            onClick={onConvert}
            className="h-7 gap-1.5 text-xs"
          >
            <RotateCcw className="h-3 w-3" /> Retry
          </Button>
        </div>
      )}

      {/* Download button */}
      {isDone && item.outputUrl && (
        <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
          <p className="flex items-center gap-1.5 text-xs text-emerald-500 dark:text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            Converted to {item.targetFormat.toUpperCase()}
          </p>
          <a
            href={item.outputUrl}
            download={`${item.file.name.replace(/\.[^.]+$/, "")}.${item.targetFormat}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            <Download className="h-3.5 w-3.5" /> Download
          </a>
        </div>
      )}
    </motion.div>
  );
}
