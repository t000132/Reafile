import posthog from "posthog-js";

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
export const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

export function initPostHog() {
  if (typeof window === "undefined" || !POSTHOG_KEY) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    session_recording: {
      maskAllInputs: false,
    },
  });
}

// ── Typed event helpers ─────────────────────────────────────────────
export function trackFileUploaded(
  fileName: string,
  fileType: string,
  sizeBytes: number,
) {
  posthog.capture("file_uploaded", {
    file_name: fileName,
    file_type: fileType,
    size_bytes: sizeBytes,
  });
}

export function trackFormatSelected(
  sourceFormat: string,
  targetFormat: string,
) {
  posthog.capture("format_selected", {
    source_format: sourceFormat,
    target_format: targetFormat,
  });
}

export function trackConversionStarted(
  sourceFormat: string,
  targetFormat: string,
) {
  posthog.capture("conversion_started", {
    source_format: sourceFormat,
    target_format: targetFormat,
  });
}

export function trackConversionFinished(
  sourceFormat: string,
  targetFormat: string,
  durationMs: number,
  success: boolean,
) {
  posthog.capture("conversion_finished", {
    source_format: sourceFormat,
    target_format: targetFormat,
    duration_ms: durationMs,
    success,
  });
}

export function trackCompressionStarted(
  sourceFormat: string,
  category: string,
  level: number,
) {
  posthog.capture("compression_started", {
    source_format: sourceFormat,
    category,
    level,
  });
}

export function trackCompressionFinished(
  sourceFormat: string,
  category: string,
  level: number,
  originalBytes: number,
  compressedBytes: number,
  durationMs: number,
  success: boolean,
) {
  posthog.capture("compression_finished", {
    source_format: sourceFormat,
    category,
    level,
    original_bytes: originalBytes,
    compressed_bytes: compressedBytes,
    ratio: originalBytes > 0 ? compressedBytes / originalBytes : 1,
    saved_bytes: originalBytes - compressedBytes,
    duration_ms: durationMs,
    success,
  });
}
