"use client";
import { useState } from "react";
import Shell from "@/components/Shell";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [rights, setRights] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function start() {
    if (!file) return;
    setBusy(true); setMsg(null);
    try {
      // 1) Server validates the file and creates the job + signed upload URL
      const r = await fetch("/api/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || file.name, filename: file.name, size: file.size, type: file.type, rightsConfirmed: rights }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Upload request failed");

      // 2) Browser uploads directly to private storage
      const sb = supabaseBrowser();
      const up = await sb.storage.from("sources").uploadToSignedUrl(j.path, j.token, file, { contentType: file.type });
      if (up.error) throw new Error(`Storage upload failed: ${up.error.message}`);

      // 3) Server verifies the object really exists before queueing
      const c = await fetch(`/api/jobs/${j.jobId}/complete`, { method: "POST" });
      const cj = await c.json();
      if (!c.ok) throw new Error(cj.error ?? "Could not finalize upload");

      setMsg({ ok: true, text: "တင်ပြီးပါပြီ။ ဒက်ရှ်ဘုတ်တွင် အခြေအနေကို ကြည့်နိုင်ပါသည်။" });
      setFile(null); setTitle(""); setRights(false);
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : String(e) });
    } finally { setBusy(false); }
  }

  return (
    <Shell title="ဗီဒီယို တင်ရန်">
      <div className="card space-y-4">
        <input className="field" placeholder="ခေါင်းစဉ် (Title)" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
        <input className="field" type="file" accept="video/mp4,video/quicktime,video/webm,video/x-matroska" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        {file && <p className="text-sm text-zinc-400">{file.name} — {(file.size / 1024 / 1024).toFixed(1)} MB</p>}
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-1 h-5 w-5" checked={rights} onChange={(e) => setRights(e.target.checked)} />
          <span>ဤဗီဒီယိုကို အသုံးပြုခွင့် ရှိကြောင်း အတည်ပြုပါသည်။ (I confirm I own or am authorized to use this video.)</span>
        </label>
        <button className="btn w-full" disabled={!file || !rights || busy} onClick={start}>{busy ? "တင်နေသည်…" : "တင်မည်"}</button>
        {msg && <p className={msg.ok ? "text-emerald-300" : "text-red-300"}>{msg.text}</p>}
      </div>
    </Shell>
  );
}
