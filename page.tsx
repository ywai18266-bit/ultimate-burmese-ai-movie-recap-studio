"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const sb = supabaseBrowser();
    const { error } = mode === "in"
      ? await sb.auth.signInWithPassword({ email, password })
      : await sb.auth.signUp({ email, password });
    setBusy(false);
    if (error) return setMsg(error.message);
    if (mode === "up") return setMsg("အီးမေးလ်ကို စစ်ဆေးပြီး အတည်ပြုပါ (Supabase ဆက်တင်အရ)။");
    window.location.href = "/";
  }

  return (
    <div className="mx-auto mt-24 max-w-sm p-4">
      <form onSubmit={submit} className="card space-y-3">
        <div className="text-center text-xl font-bold text-gold-400">🎬 Myanmar Movie Recap Studio</div>
        <input className="field" type="email" placeholder="အီးမေးလ်" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="field" type="password" placeholder="စကားဝှက် (အနည်းဆုံး ၈ လုံး)" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
        {msg && <p className="text-sm text-amber-300">{msg}</p>}
        <button className="btn w-full" disabled={busy}>{mode === "in" ? "ဝင်ရောက်ရန်" : "အကောင့်ဖွင့်ရန်"}</button>
        <button type="button" className="w-full text-sm text-zinc-400" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "အကောင့်အသစ် ဖွင့်မည်" : "အကောင့်ရှိပြီး ဝင်မည်"}
        </button>
      </form>
    </div>
  );
}
