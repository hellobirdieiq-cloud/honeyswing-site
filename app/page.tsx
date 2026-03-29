import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FDF8F0]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12">
        <span
          className="text-2xl font-bold text-[#1B3A2D]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          HoneySwing
        </span>
        <Link
          href="/login"
          className="rounded-lg bg-[#1B3A2D] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1B3A2D]/90"
        >
          Coach Login
        </Link>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1
          className="max-w-2xl text-4xl font-bold leading-tight text-[#1B3A2D] md:text-6xl"
          style={{ fontFamily: "Georgia, serif" }}
        >
          AI-powered swing analysis for junior golfers
        </h1>
        <p className="mt-6 max-w-lg text-lg text-[#1B3A2D]/70">
          HoneySwing uses computer vision to help coaches break down swings,
          track progress, and accelerate improvement for young athletes.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="https://apps.apple.com/app/id6760777790"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1B3A2D] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#1B3A2D]/90"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            Download on the App Store
          </a>

          <Link
            href="/login"
            className="inline-flex items-center gap-1 rounded-xl border-2 border-[#D4A843] px-6 py-3 font-semibold text-[#D4A843] transition-colors hover:bg-[#D4A843] hover:text-white"
          >
            Coach Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-sm text-[#1B3A2D]/50">
        &copy; {new Date().getFullYear()} HoneySwing. All rights reserved.
      </footer>
    </div>
  );
}
