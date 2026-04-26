"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileUp,
  ImageIcon,
  Film,
  Music,
  FileText,
  Table,
  Presentation,
  BookOpen,
  Type,
  PenTool,
  Archive,
  Code,
  Download,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CompressionCard } from "@/components/compression-card";
import { useCompressor } from "@/hooks/use-compressor";

export default function CompressPage() {
  const {
    items,
    addFiles,
    changeLevel,
    compressItem,
    removeItem,
    downloadAllAsZip,
  } = useCompressor();

  const onDrop = useCallback(
    (accepted: File[]) => addFiles(accepted),
    [addFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const hasDone = items.some((i) => i.outputUrl != null);

  return (
    <div className="relative flex flex-1 flex-col">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden dark:block hidden">
        <div className="absolute -top-[40%] left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/[0.07] blur-[120px]" />
        <div className="absolute -bottom-[30%] right-0 h-[600px] w-[600px] rounded-full bg-cyan-600/[0.05] blur-[100px]" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 sm:px-6">
        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full max-w-2xl"
            >
              <div className="mb-4">
                <Link href="/">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Hub
                  </Button>
                </Link>
              </div>

              <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Compress anything.{" "}
                  <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                    Smaller files.
                  </span>
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Images · video · audio · code · anything · 100% private · runs in your browser
                </p>
              </div>

              <div
                {...getRootProps()}
                className={`group relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 ${
                  isDragActive
                    ? "border-blue-500/60 bg-blue-500/[0.06] dark:border-blue-400/50"
                    : "border-border hover:border-blue-400/40 hover:bg-accent/50"
                } px-6 py-24 text-center`}
              >
                <input {...getInputProps()} />
                <motion.div
                  animate={isDragActive ? { scale: 1.04, y: -3 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors ${
                      isDragActive
                        ? "border-blue-400/30 bg-blue-500/10 text-blue-500"
                        : "border-border bg-accent/60 text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    <Sparkles className="h-6 w-6" />
                  </motion.div>
                  <p className="text-base font-medium">
                    {isDragActive ? "Drop your files here…" : "Drag & drop files to compress"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    or click to browse — any file type
                  </p>
                </motion.div>
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                {[
                  { icon: ImageIcon, label: "Images", color: "text-violet-500" },
                  { icon: Film, label: "Videos", color: "text-blue-500" },
                  { icon: Music, label: "Audio", color: "text-emerald-500" },
                  { icon: FileText, label: "Docs", color: "text-amber-500" },
                  { icon: Table, label: "Sheets", color: "text-green-500" },
                  { icon: Presentation, label: "Slides", color: "text-orange-500" },
                  { icon: BookOpen, label: "Ebooks", color: "text-rose-500" },
                  { icon: Type, label: "Fonts", color: "text-pink-500" },
                  { icon: PenTool, label: "Vectors", color: "text-cyan-500" },
                  { icon: Archive, label: "Archives", color: "text-yellow-600" },
                  { icon: Code, label: "Code", color: "text-teal-500" },
                ].map(({ icon: Icon, label, color }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground"
                  >
                    <Icon className={`h-3 w-3 ${color}`} />
                    {label}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="queue"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full max-w-2xl"
            >
              <div
                {...getRootProps()}
                className={`group mb-4 cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 ${
                  isDragActive
                    ? "border-blue-500/60 bg-blue-500/[0.06]"
                    : "border-border/60 hover:border-blue-400/40 hover:bg-accent/30"
                } px-4 py-4 text-center`}
              >
                <input {...getInputProps()} />
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <FileUp className="h-4 w-4" />
                  <span>
                    {isDragActive ? "Drop here…" : "Drop more files or click to add"}
                  </span>
                </div>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link href="/">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {items.length} file{items.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  {hasDone && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={downloadAllAsZip}
                      className="h-8 cursor-pointer gap-1.5 text-xs"
                    >
                      <Download className="h-3.5 w-3.5" /> ZIP
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex max-h-[calc(100vh-16rem)] flex-col gap-2.5 overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <CompressionCard
                      key={item.id}
                      item={item}
                      onChangeLevel={(lv) => changeLevel(item.id, lv)}
                      onCompress={(lv) => compressItem(item.id, lv)}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
