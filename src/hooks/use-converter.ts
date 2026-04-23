"use client";

import { useCallback, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import JSZip from "jszip";
import {
  trackConversionFinished,
  trackConversionStarted,
  trackFileUploaded,
  trackFormatSelected,
} from "@/lib/posthog";
import {
  detectCategory,
  getExtension,
  getTargetFormats,
  getCategoryLabel,
  type FileCategory,
  type FormatOption,
} from "@/lib/formats";

// ── Types ────────────────────────────────────────────────────────────
export type ConversionStatus = "pending" | "converting" | "done" | "error";

export interface ConversionItem {
  id: string;
  file: File;
  category: FileCategory;
  sourceExtension: string;
  targetFormat: string;
  availableFormats: FormatOption[];
  status: ConversionStatus;
  progress: number;
  quality: number; // 0.1 – 1.0
  outputUrl: string | null;
  outputSize: number | null;
  formatSizes: Record<string, number>;
  sizesLoading: boolean;
  thumbnailUrl: string | null;
  error: string | null;
}

// ── Shared image constants ───────────────────────────────────────────
const imageMimeMap: Record<string, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  jfif: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  bmp: "image/bmp",
  tiff: "image/tiff",
  avif: "image/avif",
  heic: "image/heic",
  heif: "image/heif",
  jxl: "image/jxl",
  ico: "image/x-icon",
  svg: "image/svg+xml",
  apng: "image/apng",
};
const imageQualityFormats = new Set(["jpeg", "jpg", "webp", "avif", "jfif", "heic", "heif", "jxl"]);

// ── Hook ─────────────────────────────────────────────────────────────
export function useConverter() {
  const [items, setItems] = useState<ConversionItem[]>([]);
  const itemsRef = useRef<ConversionItem[]>([]);
  itemsRef.current = items;
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const loadedRef = useRef(false);
  const sizeRecomputeTokenRef = useRef<Record<string, number>>({});
  const convertItemRef = useRef<(id: string, overrideFormat?: string, overrideQuality?: number) => Promise<void>>(async () => {});

  const getFFmpeg = useCallback(async () => {
    if (ffmpegRef.current && loadedRef.current) return ffmpegRef.current;

    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;

    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.9/dist/esm";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm",
      ),
    });

    loadedRef.current = true;
    return ffmpeg;
  }, []);

  const updateItem = useCallback(
    (id: string, patch: Partial<ConversionItem>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
    },
    [],
  );

  const recomputeImageSizes = useCallback(
    async (item: ConversionItem, quality: number) => {
      const token = (sizeRecomputeTokenRef.current[item.id] ?? 0) + 1;
      sizeRecomputeTokenRef.current[item.id] = token;

      try {
        const sizes = await precomputeImageSizes(
          item.file,
          item.availableFormats,
          quality,
          item.sourceExtension,
        );

        if (sizeRecomputeTokenRef.current[item.id] !== token) return;
        updateItem(item.id, { formatSizes: sizes, sizesLoading: false });
      } catch {
        if (sizeRecomputeTokenRef.current[item.id] !== token) return;
        updateItem(item.id, { sizesLoading: false });
      }
    },
    [updateItem],
  );

  // ── Add files ────────────────────────────────────────────────────
  const addFiles = useCallback((files: File[]) => {
    const newItems: ConversionItem[] = files.map((file) => {
      const category = detectCategory(file.type, file.name);
      const sourceExt = getExtension(file.name);
      const available = getTargetFormats(category);
      const defaultTarget =
        available.find((f) => f.value !== sourceExt)?.value ??
        available[0]?.value ??
        "png";

      trackFileUploaded(file.name, file.type, file.size);

      return {
        id: crypto.randomUUID(),
        file,
        category,
        sourceExtension: sourceExt,
        targetFormat: defaultTarget,
        availableFormats: available,
        status: "pending" as const,
        progress: 0,
        quality: 0.92,
        outputUrl: null,
        outputSize: null,
        formatSizes: {},
        sizesLoading: category === "image",
        thumbnailUrl: category === "image" ? URL.createObjectURL(file) : null,
        error: null,
      };
    });

    setItems((prev) => [...prev, ...newItems]);

    // Precompute sizes for image files
    for (const item of newItems) {
      if (item.category === "image") {
        recomputeImageSizes(item, item.quality);
      }
    }

    // Auto-convert each new file to its default target format
    for (const item of newItems) {
      convertItemRef.current(item.id);
    }
  }, [recomputeImageSizes]);

  // ── Change target format ─────────────────────────────────────────
  const changeFormat = useCallback((id: string, format: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) trackFormatSelected(item.sourceExtension, format);
      return prev.map((i) =>
        i.id === id ? { ...i, targetFormat: format } : i,
      );
    });
  }, []);

  // ── Change quality ───────────────────────────────────────────────
  const changeQuality = useCallback((id: string, quality: number) => {
    const item = itemsRef.current.find((i) => i.id === id);
    if (!item) return;

    // Show loader immediately while size estimates refresh.
    if (item.category === "image") {
      updateItem(id, { quality, sizesLoading: true });
      void recomputeImageSizes(item, quality);
      return;
    }

    updateItem(id, { quality });
  }, [recomputeImageSizes, updateItem]);

  // ── Convert a single item ────────────────────────────────────────
  const convertItem = useCallback(
    async (id: string, overrideFormat?: string, overrideQuality?: number) => {
      // Read current item directly from ref (always fresh)
      const item = itemsRef.current.find((i) => i.id === id);
      if (!item || item.status === "converting") return;

      // Build snapshot with overrides
      const snapshot = { ...item };
      if (overrideFormat) snapshot.targetFormat = overrideFormat;
      if (overrideQuality !== undefined) snapshot.quality = overrideQuality;

      // Persist overrides + set converting
      if (snapshot.outputUrl) URL.revokeObjectURL(snapshot.outputUrl);
      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                targetFormat: snapshot.targetFormat,
                quality: snapshot.quality,
                status: "converting" as const,
                progress: 0,
                error: null,
                outputUrl: null,
                outputSize: null,
              }
            : i,
        ),
      );
      trackConversionStarted(snapshot.sourceExtension, snapshot.targetFormat);
      const start = performance.now();

      try {
        let url: string;
        let outputSize: number;
        const onProgress = (p: number) => updateItem(id, { progress: p });

        if (snapshot.category === "image") {
          const blob = await convertImage(snapshot, onProgress);
          url = URL.createObjectURL(blob);
          outputSize = blob.size;
        } else if (snapshot.category === "code") {
          url = await convertTextData(snapshot, onProgress);
          const resp = await fetch(url);
          outputSize = (await resp.blob()).size;
        } else if (
          snapshot.category === "video" ||
          snapshot.category === "audio"
        ) {
          const ffmpeg = await getFFmpeg();
          url = await convertMedia(ffmpeg, snapshot, onProgress);
          const resp = await fetch(url);
          outputSize = (await resp.blob()).size;
        } else {
          url = await convertGeneric(snapshot, onProgress);
          const resp = await fetch(url);
          outputSize = (await resp.blob()).size;
        }

        setItems((prev) => prev.map((i) => {
          if (i.id !== id) return i;
          return {
            ...i,
            status: "done" as const,
            progress: 100,
            outputUrl: url,
            outputSize,
          };
        }));
        trackConversionFinished(
          snapshot.sourceExtension,
          snapshot.targetFormat,
          performance.now() - start,
          true,
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Conversion failed";
        updateItem(id, { status: "error", error: message });
        trackConversionFinished(
          snapshot.sourceExtension,
          snapshot.targetFormat,
          performance.now() - start,
          false,
        );
      }
    },
    [getFFmpeg, updateItem],
  );

  // Keep ref in sync
  convertItemRef.current = convertItem;

  // ── Convert all pending ──────────────────────────────────────────
  const convertAll = useCallback(async () => {
    const ids: string[] = [];
    setItems((prev) => {
      prev.forEach((i) => {
        if (i.status === "pending" || i.status === "error") ids.push(i.id);
      });
      return prev;
    });
    await Promise.allSettled(ids.map((id) => convertItem(id)));
  }, [convertItem]);

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
    const doneItems = items.filter((i) => i.status === "done" && i.outputUrl);
    if (doneItems.length === 0) return;

    const zip = new JSZip();
    await Promise.all(
      doneItems.map(async (item) => {
        const response = await fetch(item.outputUrl!);
        const blob = await response.blob();
        const name = `${item.file.name.replace(/\.[^.]+$/, "")}.${item.targetFormat}`;
        zip.file(name, blob);
      }),
    );

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reafile-converted.zip";
    a.click();
    URL.revokeObjectURL(url);
  }, [items]);

  return {
    items,
    addFiles,
    changeFormat,
    changeQuality,
    convertItem,
    convertAll,
    removeItem,
    clearAll,
    downloadAllAsZip,
  };
}

// ── Image conversion (Canvas API) ────────────────────────────────────
async function convertImage(
  item: ConversionItem,
  onProgress: (p: number) => void,
): Promise<Blob> {
  onProgress(10);
  const bitmap = await createImageBitmap(item.file);
  onProgress(40);

  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  onProgress(60);

  const mime = imageMimeMap[item.targetFormat] ?? "image/png";
  const blobOpts: ImageEncodeOptions = { type: mime };
  if (imageQualityFormats.has(item.targetFormat)) {
    blobOpts.quality = item.quality;
  }
  const blob = await canvas.convertToBlob(blobOpts);
  onProgress(90);

  return blob;
}

// ── Precompute image sizes for all formats ───────────────────────────
async function precomputeImageSizes(
  file: File,
  formats: FormatOption[],
  quality: number,
  sourceExt: string,
): Promise<Record<string, number>> {
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);

  const sizes: Record<string, number> = {};
  for (const format of formats) {
    if (format.value === sourceExt) continue;
    try {
      const mime = imageMimeMap[format.value] ?? "image/png";
      const opts: ImageEncodeOptions = { type: mime };
      if (imageQualityFormats.has(format.value)) {
        opts.quality = quality;
      }
      const blob = await canvas.convertToBlob(opts);
      sizes[format.value] = blob.size;
    } catch {
      // Format not supported by browser
    }
  }

  bitmap.close();
  return sizes;
}

// ── Media conversion (ffmpeg.wasm) ───────────────────────────────────
async function convertMedia(
  ffmpeg: FFmpeg,
  item: ConversionItem,
  onProgress: (p: number) => void,
): Promise<string> {
  const inputName = `input.${item.sourceExtension}`;
  const outputName = `output.${item.targetFormat}`;

  ffmpeg.on("progress", ({ progress }) => {
    onProgress(Math.round(progress * 100));
  });

  await ffmpeg.writeFile(inputName, await fetchFile(item.file));
  await ffmpeg.exec(["-i", inputName, outputName]);

  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data instanceof Uint8Array ? data.slice().buffer : data], {
    type: `${item.category}/${item.targetFormat}`,
  });
  const url = URL.createObjectURL(blob);

  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  return url;
}

// ── Text / Data conversion (JSON ↔ YAML ↔ CSV ↔ XML etc.) ───────────
async function convertTextData(
  item: ConversionItem,
  onProgress: (p: number) => void,
): Promise<string> {
  onProgress(10);
  const text = await item.file.text();
  onProgress(30);

  let parsed: unknown;
  const src = item.sourceExtension;
  const tgt = item.targetFormat;

  // Parse source
  if (src === "json") {
    parsed = JSON.parse(text);
  } else if (src === "yaml" || src === "yml") {
    // Simple YAML key:value parse (flat)
    parsed = simpleYamlParse(text);
  } else if (src === "csv" || src === "tsv") {
    const sep = src === "tsv" ? "\t" : ",";
    parsed = csvToObjects(text, sep);
  } else if (src === "xml" || src === "html" || src === "htm") {
    // Pass through as text
    parsed = text;
  } else if (src === "toml" || src === "ini" || src === "conf") {
    parsed = simpleIniParse(text);
  } else {
    parsed = text;
  }
  onProgress(60);

  // Serialize to target
  let output: string;
  let mime = "text/plain";

  if (tgt === "json") {
    output = JSON.stringify(parsed, null, 2);
    mime = "application/json";
  } else if (tgt === "yaml") {
    output = objectToYaml(parsed);
    mime = "text/yaml";
  } else if (tgt === "csv") {
    output = objectsToCsv(parsed, ",");
    mime = "text/csv";
  } else if (tgt === "tsv") {
    output = objectsToCsv(parsed, "\t");
    mime = "text/tab-separated-values";
  } else if (tgt === "xml") {
    output = objectToXml(parsed);
    mime = "application/xml";
  } else if (tgt === "html") {
    output = typeof parsed === "string" ? parsed : `<pre>${escapeHtml(JSON.stringify(parsed, null, 2))}</pre>`;
    mime = "text/html";
  } else if (tgt === "toml" || tgt === "ini") {
    output = objectToIni(parsed);
    mime = "text/plain";
  } else {
    output = typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2);
  }
  onProgress(90);

  const blob = new Blob([output], { type: mime });
  return URL.createObjectURL(blob);
}

// ── Generic pass-through conversion (repackage as target type) ───────
async function convertGeneric(
  item: ConversionItem,
  onProgress: (p: number) => void,
): Promise<string> {
  onProgress(20);
  const buffer = await item.file.arrayBuffer();
  onProgress(70);

  const mimeGuess = guessMime(item.targetFormat, item.category);
  const blob = new Blob([buffer], { type: mimeGuess });
  onProgress(100);

  return URL.createObjectURL(blob);
}

// ── Helpers ──────────────────────────────────────────────────────────
function guessMime(ext: string, category: string): string {
  const map: Record<string, string> = {
    pdf: "application/pdf",
    zip: "application/zip",
    "7z": "application/x-7z-compressed",
    tar: "application/x-tar",
    gz: "application/gzip",
    bz2: "application/x-bzip2",
    xz: "application/x-xz",
    rar: "application/vnd.rar",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ppt: "application/vnd.ms-powerpoint",
    odt: "application/vnd.oasis.opendocument.text",
    ods: "application/vnd.oasis.opendocument.spreadsheet",
    odp: "application/vnd.oasis.opendocument.presentation",
    epub: "application/epub+zip",
    mobi: "application/x-mobipocket-ebook",
    ttf: "font/ttf",
    otf: "font/otf",
    woff: "font/woff",
    woff2: "font/woff2",
    eot: "application/vnd.ms-fontobject",
    svg: "image/svg+xml",
    eps: "application/postscript",
    txt: "text/plain",
    html: "text/html",
    rtf: "application/rtf",
    csv: "text/csv",
    tsv: "text/tab-separated-values",
    json: "application/json",
    xml: "application/xml",
    yaml: "text/yaml",
  };
  return map[ext] ?? `${category}/${ext}`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function csvToObjects(text: string, sep: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [{ value: text }];
  const headers = lines[0].split(sep).map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const vals = line.split(sep).map((v) => v.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
    return obj;
  });
}

function objectsToCsv(data: unknown, sep: string): string {
  if (!Array.isArray(data)) {
    if (typeof data === "object" && data !== null) data = [data];
    else return String(data);
  }
  const arr = data as Record<string, unknown>[];
  if (arr.length === 0) return "";
  const keys = Object.keys(arr[0]);
  const header = keys.join(sep);
  const rows = arr.map((row) => keys.map((k) => String(row[k] ?? "")).join(sep));
  return [header, ...rows].join("\n");
}

function simpleYamlParse(text: string): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key && !key.startsWith("#")) obj[key] = val;
    }
  }
  return obj;
}

function objectToYaml(data: unknown): string {
  if (typeof data === "string") return data;
  if (Array.isArray(data)) {
    return data.map((item, i) => {
      if (typeof item === "object" && item !== null) {
        const entries = Object.entries(item as Record<string, unknown>);
        const first = entries[0] ? `- ${entries[0][0]}: ${entries[0][1]}` : `- item_${i}`;
        const rest = entries.slice(1).map(([k, v]) => `  ${k}: ${v}`);
        return [first, ...rest].join("\n");
      }
      return `- ${item}`;
    }).join("\n");
  }
  if (typeof data === "object" && data !== null) {
    return Object.entries(data as Record<string, unknown>)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
  }
  return String(data);
}

function objectToXml(data: unknown): string {
  if (typeof data === "string") return data;
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
  if (Array.isArray(data)) {
    data.forEach((item) => {
      xml += "  <item>\n";
      if (typeof item === "object" && item !== null) {
        Object.entries(item as Record<string, unknown>).forEach(([k, v]) => {
          xml += `    <${k}>${escapeHtml(String(v))}</${k}>\n`;
        });
      } else {
        xml += `    <value>${escapeHtml(String(item))}</value>\n`;
      }
      xml += "  </item>\n";
    });
  } else if (typeof data === "object" && data !== null) {
    Object.entries(data as Record<string, unknown>).forEach(([k, v]) => {
      xml += `  <${k}>${escapeHtml(String(v))}</${k}>\n`;
    });
  }
  xml += "</root>";
  return xml;
}

function simpleIniParse(text: string): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith(";") || trimmed.startsWith("[")) continue;
    const idx = trimmed.indexOf("=");
    if (idx > 0) {
      obj[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  }
  return obj;
}

function objectToIni(data: unknown): string {
  if (typeof data === "string") return data;
  if (typeof data === "object" && data !== null) {
    return Object.entries(data as Record<string, unknown>)
      .map(([k, v]) => `${k} = ${v}`)
      .join("\n");
  }
  return String(data);
}
