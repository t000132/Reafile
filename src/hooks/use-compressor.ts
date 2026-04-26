"use client";

import { useCallback, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import JSZip from "jszip";
import {
  trackCompressionFinished,
  trackCompressionStarted,
  trackFileUploaded,
} from "@/lib/posthog";
import {
  detectCategory,
  getExtension,
  type FileCategory,
} from "@/lib/formats";

// ── Types ────────────────────────────────────────────────────────────
export type CompressionStatus = "pending" | "compressing" | "done" | "error";

/**
 * Strategies the compressor can apply.
 * - "image-reencode"  — Canvas re-encode to webp/jpeg/avif (lossy quality).
 * - "video-crf"       — ffmpeg.wasm H.264 + AAC at chosen CRF.
 * - "audio-bitrate"   — ffmpeg.wasm encode to mp3/aac at chosen bitrate.
 * - "text-minify"     — Strip whitespace from JSON/XML/HTML/CSS/JS/SVG.
 * - "deflate-zip"     — Wrap in ZIP with max DEFLATE (everything else).
 */
export type CompressionStrategy =
  | "image-reencode"
  | "video-crf"
  | "audio-bitrate"
  | "text-minify"
  | "deflate-zip";

export interface CompressionItem {
  id: string;
  file: File;
  category: FileCategory;
  sourceExtension: string;
  strategy: CompressionStrategy;
  /** 0–100. Higher = more compression / smaller file (lower quality). */
  level: number;
  status: CompressionStatus;
  progress: number;
  outputUrl: string | null;
  outputName: string | null;
  outputSize: number | null;
  thumbnailUrl: string | null;
  error: string | null;
  estimatedSize: number | null;
  estimating: boolean;
  /** True when the file is already heavily compressed (mp3, jpeg, mp4, …). */
  alreadyCompressedHint: boolean;
}

// ── Strategy selection ───────────────────────────────────────────────
const REENCODE_IMAGE_EXTS = new Set([
  "png", "jpg", "jpeg", "jfif", "webp", "bmp", "tiff", "tif", "avif", "gif",
  "heic", "heif", "jxl", "apng",
]);
// SVG is text — keep as text-minify.

const TEXT_MINIFY_EXTS = new Set([
  "json", "xml", "html", "htm", "svg", "css", "js", "mjs", "cjs",
  "csv", "tsv", "yaml", "yml", "toml", "ini", "conf", "md", "txt", "rtf",
]);

const ALREADY_COMPRESSED = new Set([
  "jpg", "jpeg", "jfif", "webp", "avif", "heic", "heif", "jxl",
  "mp3", "aac", "m4a", "ogg", "opus",
  "mp4", "webm", "mkv", "mov", "m4v",
  "zip", "7z", "rar", "gz", "bz2", "xz", "tgz",
  "docx", "xlsx", "pptx", "odt", "ods", "odp", "epub", "pdf",
  "woff", "woff2",
]);

function pickStrategy(
  category: FileCategory,
  ext: string,
): CompressionStrategy {
  if (category === "image" && REENCODE_IMAGE_EXTS.has(ext)) return "image-reencode";
  if (category === "video") return "video-crf";
  if (category === "audio") return "audio-bitrate";
  if (TEXT_MINIFY_EXTS.has(ext)) return "text-minify";
  return "deflate-zip";
}

// ── Hook ─────────────────────────────────────────────────────────────
export function useCompressor() {
  const [items, setItems] = useState<CompressionItem[]>([]);
  const itemsRef = useRef<CompressionItem[]>([]);
  itemsRef.current = items;
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const ffmpegLoadedRef = useRef(false);
  const estimateTokenRef = useRef<Record<string, number>>({});

  const getFFmpeg = useCallback(async () => {
    if (ffmpegRef.current && ffmpegLoadedRef.current) return ffmpegRef.current;
    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.9/dist/esm";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });
    ffmpegLoadedRef.current = true;
    return ffmpeg;
  }, []);

  const updateItem = useCallback(
    (id: string, patch: Partial<CompressionItem>) => {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      );
    },
    [],
  );

  // ── Estimate output size for image re-encode (cheap canvas pass) ──
  const estimateImageSize = useCallback(
    async (item: CompressionItem, level: number) => {
      const token = (estimateTokenRef.current[item.id] ?? 0) + 1;
      estimateTokenRef.current[item.id] = token;
      try {
        const blob = await reencodeImage(item.file, level);
        if (estimateTokenRef.current[item.id] !== token) return;
        updateItem(item.id, { estimatedSize: blob.size, estimating: false });
      } catch {
        if (estimateTokenRef.current[item.id] !== token) return;
        updateItem(item.id, { estimating: false });
      }
    },
    [updateItem],
  );

  // ── Add files ────────────────────────────────────────────────────
  const addFiles = useCallback(
    (files: File[]) => {
      const newItems: CompressionItem[] = files.map((file) => {
        const category = detectCategory(file.type, file.name);
        const ext = getExtension(file.name);
        const strategy = pickStrategy(category, ext);
        trackFileUploaded(file.name, file.type, file.size);
        return {
          id: crypto.randomUUID(),
          file,
          category,
          sourceExtension: ext,
          strategy,
          level: 60, // default — moderate compression
          status: "pending" as const,
          progress: 0,
          outputUrl: null,
          outputName: null,
          outputSize: null,
          thumbnailUrl: category === "image" ? URL.createObjectURL(file) : null,
          error: null,
          estimatedSize: null,
          estimating: strategy === "image-reencode",
          alreadyCompressedHint: ALREADY_COMPRESSED.has(ext),
        };
      });
      setItems((prev) => [...prev, ...newItems]);
      for (const item of newItems) {
        if (item.strategy === "image-reencode") {
          void estimateImageSize(item, item.level);
        }
      }
    },
    [estimateImageSize],
  );

  // ── Change compression level ─────────────────────────────────────
  const changeLevel = useCallback(
    (id: string, level: number) => {
      const item = itemsRef.current.find((i) => i.id === id);
      if (!item) return;
      if (item.strategy === "image-reencode") {
        updateItem(id, { level, estimating: true, outputSize: null });
        void estimateImageSize(item, level);
        return;
      }
      updateItem(id, { level });
    },
    [estimateImageSize, updateItem],
  );

  // ── Compress one item ────────────────────────────────────────────
  const compressItem = useCallback(
    async (id: string, overrideLevel?: number) => {
      const current = itemsRef.current.find((i) => i.id === id);
      if (!current || current.status === "compressing") return;
      const snapshot = { ...current };
      if (overrideLevel !== undefined) snapshot.level = overrideLevel;

      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                level: snapshot.level,
                status: "compressing" as const,
                progress: 0,
                error: null,
                outputSize: null,
              }
            : i,
        ),
      );
      trackCompressionStarted(snapshot.sourceExtension, snapshot.category, snapshot.level);
      const start = performance.now();

      try {
        const onProgress = (p: number) => updateItem(id, { progress: p });
        let blob: Blob;
        let outName: string;

        if (snapshot.strategy === "image-reencode") {
          blob = await reencodeImage(snapshot.file, snapshot.level, onProgress);
          outName = `${stripExt(snapshot.file.name)}.webp`;
        } else if (snapshot.strategy === "video-crf") {
          const ffmpeg = await getFFmpeg();
          const { blob: b, name } = await compressVideo(ffmpeg, snapshot, onProgress);
          blob = b;
          outName = name;
        } else if (snapshot.strategy === "audio-bitrate") {
          const ffmpeg = await getFFmpeg();
          const { blob: b, name } = await compressAudio(ffmpeg, snapshot, onProgress);
          blob = b;
          outName = name;
        } else if (snapshot.strategy === "text-minify") {
          blob = await minifyText(snapshot, onProgress);
          outName = snapshot.file.name; // keep extension
        } else {
          blob = await deflateZip(snapshot.file, onProgress);
          outName = `${snapshot.file.name}.zip`;
        }

        if (snapshot.outputUrl) URL.revokeObjectURL(snapshot.outputUrl);
        const url = URL.createObjectURL(blob);

        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: "done" as const,
                  progress: 100,
                  outputUrl: url,
                  outputName: outName,
                  outputSize: blob.size,
                }
              : i,
          ),
        );
        trackCompressionFinished(
          snapshot.sourceExtension,
          snapshot.category,
          snapshot.level,
          snapshot.file.size,
          blob.size,
          performance.now() - start,
          true,
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Compression failed";
        updateItem(id, { status: "error", error: message });
        trackCompressionFinished(
          snapshot.sourceExtension,
          snapshot.category,
          snapshot.level,
          snapshot.file.size,
          0,
          performance.now() - start,
          false,
        );
      }
    },
    [getFFmpeg, updateItem],
  );

  // ── Remove / Clear ───────────────────────────────────────────────
  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.outputUrl) URL.revokeObjectURL(item.outputUrl);
      if (item?.thumbnailUrl) URL.revokeObjectURL(item.thumbnailUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems((prev) => {
      prev.forEach((i) => {
        if (i.outputUrl) URL.revokeObjectURL(i.outputUrl);
        if (i.thumbnailUrl) URL.revokeObjectURL(i.thumbnailUrl);
      });
      return [];
    });
  }, []);

  // ── Download all done items as ZIP ───────────────────────────────
  const downloadAllAsZip = useCallback(async () => {
    const done = items.filter((i) => i.status === "done" && i.outputUrl);
    if (done.length === 0) return;
    const zip = new JSZip();
    await Promise.all(
      done.map(async (item) => {
        const r = await fetch(item.outputUrl!);
        const b = await r.blob();
        zip.file(item.outputName ?? item.file.name, b);
      }),
    );
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reafile-compressed.zip";
    a.click();
    URL.revokeObjectURL(url);
  }, [items]);

  return {
    items,
    addFiles,
    changeLevel,
    compressItem,
    removeItem,
    clearAll,
    downloadAllAsZip,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Strategies
// ─────────────────────────────────────────────────────────────────────

function stripExt(name: string): string {
  return name.replace(/\.[^.]+$/, "");
}

// ── Image: re-encode via OffscreenCanvas → WebP ──────────────────────
// level 0   → quality 1.0 (best)
// level 100 → quality 0.15 (smallest)
async function reencodeImage(
  file: File,
  level: number,
  onProgress?: (p: number) => void,
): Promise<Blob> {
  onProgress?.(10);
  const bitmap = await createImageBitmap(file);
  onProgress?.(40);

  // Optionally downscale at very high levels to gain real bytes back.
  let { width, height } = bitmap;
  if (level >= 80) {
    const scale = 1 - (level - 80) / 200; // 80→1.0, 100→0.9 ish
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
  }

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  onProgress?.(70);

  const quality = Math.max(0.15, 1 - level / 100 * 0.85);
  const blob = await canvas.convertToBlob({ type: "image/webp", quality });
  bitmap.close();
  onProgress?.(95);
  return blob;
}

// ── Video: ffmpeg H.264 with CRF ─────────────────────────────────────
// level 0 → CRF 18 (visually lossless), level 100 → CRF 38 (tiny)
async function compressVideo(
  ffmpeg: FFmpeg,
  item: CompressionItem,
  onProgress: (p: number) => void,
): Promise<{ blob: Blob; name: string }> {
  const inExt = item.sourceExtension || "mp4";
  const inputName = `in.${inExt}`;
  const outputName = `out.mp4`;
  const crf = Math.round(18 + (item.level / 100) * 20); // 18..38
  const preset = item.level >= 70 ? "veryfast" : "medium";

  ffmpeg.on("progress", ({ progress }) => {
    onProgress(Math.max(1, Math.min(99, Math.round(progress * 100))));
  });

  await ffmpeg.writeFile(inputName, await fetchFile(item.file));
  await ffmpeg.exec([
    "-i", inputName,
    "-c:v", "libx264",
    "-preset", preset,
    "-crf", String(crf),
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    outputName,
  ]);
  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data instanceof Uint8Array ? data.slice().buffer : data], {
    type: "video/mp4",
  });
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);
  return { blob, name: `${stripExt(item.file.name)}.mp4` };
}

// ── Audio: ffmpeg MP3 with bitrate ───────────────────────────────────
// level 0 → 320 kbps, level 100 → 48 kbps
async function compressAudio(
  ffmpeg: FFmpeg,
  item: CompressionItem,
  onProgress: (p: number) => void,
): Promise<{ blob: Blob; name: string }> {
  const inputName = `in.${item.sourceExtension || "mp3"}`;
  const outputName = `out.mp3`;
  const bitrate = Math.max(48, Math.round(320 - (item.level / 100) * 272));

  ffmpeg.on("progress", ({ progress }) => {
    onProgress(Math.max(1, Math.min(99, Math.round(progress * 100))));
  });

  await ffmpeg.writeFile(inputName, await fetchFile(item.file));
  await ffmpeg.exec([
    "-i", inputName,
    "-codec:a", "libmp3lame",
    "-b:a", `${bitrate}k`,
    outputName,
  ]);
  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data instanceof Uint8Array ? data.slice().buffer : data], {
    type: "audio/mpeg",
  });
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);
  return { blob, name: `${stripExt(item.file.name)}.mp3` };
}

// ── Text minification (whitespace stripping) ─────────────────────────
async function minifyText(
  item: CompressionItem,
  onProgress: (p: number) => void,
): Promise<Blob> {
  onProgress(10);
  const text = await item.file.text();
  onProgress(50);
  let out = text;
  const ext = item.sourceExtension;

  try {
    if (ext === "json") {
      out = JSON.stringify(JSON.parse(text));
    } else if (ext === "svg" || ext === "xml" || ext === "html" || ext === "htm") {
      out = text
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/>\s+</g, "><")
        .replace(/\s{2,}/g, " ")
        .trim();
    } else if (ext === "css") {
      out = text
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\s*([{}:;,])\s*/g, "$1")
        .replace(/;}/g, "}")
        .replace(/\s{2,}/g, " ")
        .trim();
    } else if (ext === "js" || ext === "mjs" || ext === "cjs") {
      // Conservative: strip only block comments + collapse whitespace runs.
      // Preserves strings imperfectly — safe enough for general source.
      out = text
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^[ \t]+/gm, "")
        .replace(/\n{2,}/g, "\n")
        .trim();
    } else {
      // CSV/TSV/MD/TXT/YAML/INI/TOML: trim trailing whitespace + collapse blank lines.
      out = text
        .split("\n")
        .map((l) => l.replace(/[ \t]+$/g, ""))
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    }
  } catch {
    // Keep original on parse failure.
    out = text;
  }
  onProgress(90);
  return new Blob([out], { type: item.file.type || "text/plain" });
}

// ── Generic: wrap original in a max-DEFLATE ZIP ──────────────────────
async function deflateZip(
  file: File,
  onProgress: (p: number) => void,
): Promise<Blob> {
  onProgress(10);
  const buf = await file.arrayBuffer();
  onProgress(30);
  const zip = new JSZip();
  zip.file(file.name, buf);
  const blob = await zip.generateAsync(
    {
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    },
    (meta) => {
      onProgress(30 + Math.round(meta.percent * 0.65));
    },
  );
  onProgress(98);
  return blob;
}
