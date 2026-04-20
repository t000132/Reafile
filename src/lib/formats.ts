export type FileCategory =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "ebook"
  | "font"
  | "vector"
  | "archive"
  | "code";

export interface FormatOption {
  value: string;
  label: string;
}

// ── Images ───────────────────────────────────────────────────────────
const IMAGE_FORMATS: FormatOption[] = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
  { value: "jpg", label: "JPG" },
  { value: "webp", label: "WebP" },
  { value: "gif", label: "GIF" },
  { value: "bmp", label: "BMP" },
  { value: "tiff", label: "TIFF" },
  { value: "avif", label: "AVIF" },
  { value: "ico", label: "ICO" },
  { value: "heic", label: "HEIC" },
  { value: "heif", label: "HEIF" },
  { value: "jxl", label: "JPEG XL" },
  { value: "svg", label: "SVG" },
  { value: "jfif", label: "JFIF" },
  { value: "apng", label: "APNG" },
];

// ── Video ────────────────────────────────────────────────────────────
const VIDEO_FORMATS: FormatOption[] = [
  { value: "mp4", label: "MP4" },
  { value: "webm", label: "WebM" },
  { value: "avi", label: "AVI" },
  { value: "mov", label: "MOV" },
  { value: "mkv", label: "MKV" },
  { value: "flv", label: "FLV" },
  { value: "wmv", label: "WMV" },
  { value: "m4v", label: "M4V" },
  { value: "mpg", label: "MPG" },
  { value: "mpeg", label: "MPEG" },
  { value: "3gp", label: "3GP" },
  { value: "ogv", label: "OGV" },
  { value: "ts", label: "TS" },
  { value: "gif", label: "GIF (anim)" },
];

// ── Audio ────────────────────────────────────────────────────────────
const AUDIO_FORMATS: FormatOption[] = [
  { value: "mp3", label: "MP3" },
  { value: "wav", label: "WAV" },
  { value: "ogg", label: "OGG" },
  { value: "aac", label: "AAC" },
  { value: "flac", label: "FLAC" },
  { value: "m4a", label: "M4A" },
  { value: "wma", label: "WMA" },
  { value: "opus", label: "OPUS" },
  { value: "aiff", label: "AIFF" },
  { value: "amr", label: "AMR" },
  { value: "ac3", label: "AC3" },
  { value: "mid", label: "MIDI" },
];

// ── Documents ────────────────────────────────────────────────────────
const DOCUMENT_FORMATS: FormatOption[] = [
  { value: "pdf", label: "PDF" },
  { value: "txt", label: "TXT" },
  { value: "rtf", label: "RTF" },
  { value: "html", label: "HTML" },
  { value: "md", label: "Markdown" },
  { value: "docx", label: "DOCX" },
  { value: "doc", label: "DOC" },
  { value: "odt", label: "ODT" },
  { value: "tex", label: "LaTeX" },
  { value: "epub", label: "EPUB" },
  { value: "djvu", label: "DjVu" },
  { value: "pages", label: "Pages" },
  { value: "wpd", label: "WPD" },
];

// ── Spreadsheets ─────────────────────────────────────────────────────
const SPREADSHEET_FORMATS: FormatOption[] = [
  { value: "csv", label: "CSV" },
  { value: "tsv", label: "TSV" },
  { value: "xlsx", label: "XLSX" },
  { value: "xls", label: "XLS" },
  { value: "ods", label: "ODS" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
  { value: "html", label: "HTML Table" },
];

// ── Presentations ────────────────────────────────────────────────────
const PRESENTATION_FORMATS: FormatOption[] = [
  { value: "pptx", label: "PPTX" },
  { value: "ppt", label: "PPT" },
  { value: "odp", label: "ODP" },
  { value: "pdf", label: "PDF" },
  { value: "html", label: "HTML" },
];

// ── Ebooks ───────────────────────────────────────────────────────────
const EBOOK_FORMATS: FormatOption[] = [
  { value: "epub", label: "EPUB" },
  { value: "mobi", label: "MOBI" },
  { value: "azw3", label: "AZW3" },
  { value: "pdf", label: "PDF" },
  { value: "txt", label: "TXT" },
  { value: "html", label: "HTML" },
  { value: "fb2", label: "FB2" },
];

// ── Fonts ────────────────────────────────────────────────────────────
const FONT_FORMATS: FormatOption[] = [
  { value: "woff2", label: "WOFF2" },
  { value: "woff", label: "WOFF" },
  { value: "ttf", label: "TTF" },
  { value: "otf", label: "OTF" },
  { value: "eot", label: "EOT" },
  { value: "svg", label: "SVG Font" },
];

// ── Vector / Design ──────────────────────────────────────────────────
const VECTOR_FORMATS: FormatOption[] = [
  { value: "svg", label: "SVG" },
  { value: "png", label: "PNG" },
  { value: "pdf", label: "PDF" },
  { value: "eps", label: "EPS" },
  { value: "webp", label: "WebP" },
  { value: "dxf", label: "DXF" },
  { value: "ai", label: "AI" },
  { value: "wmf", label: "WMF" },
  { value: "emf", label: "EMF" },
];

// ── Archives ─────────────────────────────────────────────────────────
const ARCHIVE_FORMATS: FormatOption[] = [
  { value: "zip", label: "ZIP" },
  { value: "tar", label: "TAR" },
  { value: "gz", label: "GZ" },
  { value: "7z", label: "7Z" },
  { value: "bz2", label: "BZ2" },
  { value: "xz", label: "XZ" },
  { value: "rar", label: "RAR" },
  { value: "tgz", label: "TGZ" },
  { value: "cab", label: "CAB" },
];

// ── Code / Data ──────────────────────────────────────────────────────
const CODE_FORMATS: FormatOption[] = [
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "xml", label: "XML" },
  { value: "csv", label: "CSV" },
  { value: "toml", label: "TOML" },
  { value: "ini", label: "INI" },
  { value: "html", label: "HTML" },
  { value: "txt", label: "Plain Text" },
];

// ── Map ──────────────────────────────────────────────────────────────
const FORMAT_MAP: Record<FileCategory, FormatOption[]> = {
  image: IMAGE_FORMATS,
  video: VIDEO_FORMATS,
  audio: AUDIO_FORMATS,
  document: DOCUMENT_FORMATS,
  spreadsheet: SPREADSHEET_FORMATS,
  presentation: PRESENTATION_FORMATS,
  ebook: EBOOK_FORMATS,
  font: FONT_FORMATS,
  vector: VECTOR_FORMATS,
  archive: ARCHIVE_FORMATS,
  code: CODE_FORMATS,
};

// ── Extension → MIME helpers for dropzone ────────────────────────────
const EXT_TO_CATEGORY: Record<string, FileCategory> = {
  // Images
  png: "image", jpg: "image", jpeg: "image", webp: "image", gif: "image",
  bmp: "image", tiff: "image", tif: "image", avif: "image", ico: "image",
  heic: "image", heif: "image", jxl: "image", raw: "image", cr2: "image",
  nef: "image", arw: "image", dng: "image", psd: "image",
  // Video
  mp4: "video", webm: "video", avi: "video", mov: "video", mkv: "video",
  flv: "video", wmv: "video", m4v: "video", mpg: "video", mpeg: "video",
  "3gp": "video", ogv: "video", ts: "video", vob: "video", mts: "video",
  m2ts: "video",
  // Audio
  mp3: "audio", wav: "audio", ogg: "audio", aac: "audio", flac: "audio",
  m4a: "audio", wma: "audio", opus: "audio", aiff: "audio", aif: "audio",
  amr: "audio", ac3: "audio", mid: "audio", midi: "audio", ape: "audio",
  wv: "audio",
  // Documents
  pdf: "document", doc: "document", docx: "document", odt: "document",
  rtf: "document", tex: "document", wpd: "document", pages: "document",
  // Spreadsheets
  csv: "spreadsheet", tsv: "spreadsheet", xlsx: "spreadsheet",
  xls: "spreadsheet", ods: "spreadsheet", numbers: "spreadsheet",
  // Presentations
  pptx: "presentation", ppt: "presentation", odp: "presentation",
  key: "presentation",
  // Ebooks
  epub: "ebook", mobi: "ebook", azw3: "ebook", azw: "ebook",
  fb2: "ebook", lit: "ebook", lrf: "ebook",
  // Fonts
  ttf: "font", otf: "font", woff: "font", woff2: "font", eot: "font",
  // Vector
  svg: "vector", eps: "vector", ai: "vector",
  // Archives
  zip: "archive", tar: "archive", gz: "archive", "7z": "archive",
  bz2: "archive", xz: "archive", rar: "archive", tgz: "archive",
  // Code / Data
  json: "code", yaml: "code", yml: "code", xml: "code", toml: "code",
  ini: "code", conf: "code",
  // Plain text → document
  txt: "document", md: "document", html: "document", htm: "document",
  // Additional
  jfif: "image", apng: "image", djvu: "document", cab: "archive",
  dxf: "vector", dwg: "vector", wmf: "vector", emf: "vector",
};

export function detectCategory(mimeType: string, fileName?: string): FileCategory {
  // Try extension first for accuracy
  if (fileName) {
    const ext = getExtension(fileName);
    if (ext in EXT_TO_CATEGORY) return EXT_TO_CATEGORY[ext];
  }

  if (mimeType.startsWith("image/svg")) return "vector";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.includes("font") || mimeType.includes("woff")) return "font";
  if (mimeType.includes("zip") || mimeType.includes("compressed") || mimeType.includes("archive") || mimeType.includes("tar") || mimeType.includes("7z"))
    return "archive";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv"))
    return "spreadsheet";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return "presentation";
  if (mimeType.includes("epub") || mimeType.includes("mobi"))
    return "ebook";
  if (mimeType.includes("json") || mimeType.includes("yaml") || mimeType.includes("xml") || mimeType.includes("toml"))
    return "code";
  if (mimeType.includes("word") || mimeType.includes("document") || mimeType.includes("pdf") || mimeType.includes("rtf") || mimeType.includes("text"))
    return "document";

  // Fallback: try extension from fileName
  return "document";
}

export function getExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function getTargetFormats(category: FileCategory): FormatOption[] {
  return FORMAT_MAP[category] ?? [];
}

export function getCategoryLabel(category: FileCategory): string {
  const labels: Record<FileCategory, string> = {
    image: "Image",
    video: "Video",
    audio: "Audio",
    document: "Document",
    spreadsheet: "Spreadsheet",
    presentation: "Presentation",
    ebook: "Ebook",
    font: "Font",
    vector: "Vector",
    archive: "Archive",
    code: "Code / Data",
  };
  return labels[category];
}
