import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ALLOWED_VIDEO_TYPES, limits } from "@/lib/env";

const Body = z.object({
  title: z.string().trim().min(1).max(200),
  filename: z.string().min(1).max(300),
  size: z.number().int().positive(),
  type: z.string(),
  rightsConfirmed: z.literal(true, { errorMap: () => ({ message: "အသုံးပြုခွင့် အတည်ပြုရန် လိုအပ်သည်" }) }),
});

export async function POST(req: Request) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "ဝင်ရောက်ရန် လိုအပ်သည်" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { title, size, type } = parsed.data;

  const ext = ALLOWED_VIDEO_TYPES[type];
  if (!ext) return NextResponse.json({ error: `ဖိုင်အမျိုးအစား မပံ့ပိုးပါ (${type || "unknown"}). MP4, MOV, WEBM, MKV သာ ခွင့်ပြုသည်` }, { status: 415 });
  if (size > limits.maxUploadBytes) return NextResponse.json({ error: `ဖိုင်ကြီးလွန်းသည်။ အများဆုံး ${Math.round(limits.maxUploadBytes / 1048576)} MB` }, { status: 413 });

  const admin = supabaseAdmin();
  const { count } = await admin.from("jobs").select("id", { count: "exact", head: true })
    .eq("user_id", user.id).not("status", "in", "(completed,failed)");
  if ((count ?? 0) >= limits.maxActiveJobs) {
    return NextResponse.json({ error: `တပြိုင်နက် လုပ်ဆောင်နိုင်သော job ${limits.maxActiveJobs} ခုထက် မကျော်ရပါ` }, { status: 429 });
  }

  const jobId = crypto.randomUUID();
  const path = `${user.id}/${jobId}/source.${ext}`;
  const { error: insErr } = await admin.from("jobs").insert({
    id: jobId, user_id: user.id, title, status: "uploading", progress: 0,
    source_path: path, source_size: size, rights_confirmed: true,
  });
  if (insErr) return NextResponse.json({ error: `Database: ${insErr.message}` }, { status: 500 });

  const { data, error } = await admin.storage.from("sources").createSignedUploadUrl(path);
  if (error || !data) {
    await admin.from("jobs").update({ status: "failed", error: error?.message ?? "Signed URL failed" }).eq("id", jobId);
    return NextResponse.json({ error: `Storage: ${error?.message}` }, { status: 500 });
  }
  return NextResponse.json({ jobId, path, token: data.token });
}
