export const STATUS_LABELS: Record<string, string> = {
  uploading: "တင်နေသည်",
  queued: "တန်းစီစောင့်နေသည်",
  extracting_audio: "အသံ ထုတ်နေသည်",
  analyzing_scenes: "ဇာတ်ကွက် ခွဲခြမ်းစိတ်ဖြာနေသည်",
  writing_script: "မြန်မာ Script ရေးနေသည်",
  generating_voice: "အသံ ဖန်တီးနေသည်",
  creating_subtitles: "စာတန်းထိုး ဖန်တီးနေသည်",
  rendering: "ဗီဒီယို Render လုပ်နေသည်",
  completed: "ပြီးစီးပါပြီ",
  failed: "မအောင်မြင်ပါ",
};

export const PIPELINE_ORDER = [
  "uploading", "queued", "extracting_audio", "analyzing_scenes", "writing_script",
  "generating_voice", "creating_subtitles", "rendering", "completed",
] as const;
