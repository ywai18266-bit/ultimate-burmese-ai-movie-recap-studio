import Link from "next/link";

const NAV = [
  { href: "/", label: "ဒက်ရှ်ဘုတ်" },
  { href: "/upload", label: "ဗီဒီယို တင်ရန်" },
  { href: "/recap", label: "အလိုအလျောက် Recap" },
  { href: "/script", label: "မြန်မာ Script" },
  { href: "/voice", label: "AI အသံ" },
  { href: "/subtitles", label: "မြန်မာ စာတန်းထိုး" },
  { href: "/export", label: "ဗီဒီယို ထုတ်ရန်" },
  { href: "/settings", label: "ဆက်တင်များ" },
];

export default function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl gap-4 p-4 pb-[env(safe-area-inset-bottom)]">
      <aside className="sticky top-4 hidden h-fit w-56 shrink-0 md:block">
        <div className="card">
          <div className="mb-4 text-lg font-bold text-gold-400">🎬 Recap Studio</div>
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-800">{n.label}</Link>
            ))}
          </nav>
          <form action="/api/auth/signout" method="post" className="mt-4">
            <button className="w-full rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400">ထွက်ရန်</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <h1 className="mb-4 text-2xl font-bold">{title}</h1>
        <nav className="mb-4 flex gap-2 overflow-x-auto md:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-full border border-zinc-700 px-3 py-1.5 text-sm">{n.label}</Link>
          ))}
        </nav>
        {children}
      </main>
    </div>
  );
}
