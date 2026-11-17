import "server-only";

export const limits = {
  maxUploadBytes: Number(process.env.MAX_UPLOAD_MB ?? 2048) * 1024 * 1024,
  maxActiveJobs: Number(process.env.MAX_ACTIVE_JOBS_PER_USER ?? 2),
};

export const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/x-matroska": "mkv",
};

export type ProviderStatus = { key: string; label: string; configured: boolean; hint: string };

/** Reports only true/false. Never returns secret values. */
export function configStatus(): ProviderStatus[] {
  const has = (...names: string[]) => names.every((n) => !!process.env[n]);
  return [
    { key: "supabase", label: "Supabase", configured: has("NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"), hint: "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY" },
    { key: "claude", label: "Claude API", configured: has("ANTHROPIC_API_KEY"), hint: "ANTHROPIC_API_KEY" },
    { key: "stt", label: "Speech-to-Text", configured: has("STT_PROVIDER", "STT_API_KEY"), hint: "STT_PROVIDER, STT_API_KEY" },
    { key: "video", label: "Video Analysis", configured: has("VIDEO_ANALYSIS_PROVIDER", "VIDEO_ANALYSIS_API_KEY"), hint: "VIDEO_ANALYSIS_PROVIDER, VIDEO_ANALYSIS_API_KEY" },
    { key: "tts", label: "Myanmar TTS", configured: has("TTS_PROVIDER", "TTS_API_KEY"), hint: "TTS_PROVIDER, TTS_API_KEY" },
  ];
}
