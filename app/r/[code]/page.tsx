import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ code: string }>;
};

async function getCoachName(code: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_coach_by_code", {
    coach_code: code,
  });
  return data?.[0]?.name ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const coachName = await getCoachName(code);

  const title = coachName
    ? `Coach ${coachName} recommends HoneySwing`
    : "Improve your golf swing with HoneySwing";
  const description =
    "AI-powered swing analysis built for junior golfers. Download HoneySwing on the App Store.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: "/og-default.png", width: 1200, height: 630 }],
    },
  };
}

export default async function ReferralPage({ params }: Props) {
  const { code } = await params;
  const coachName = await getCoachName(code);

  return (
    <div className="min-h-screen bg-honey-cream">
      <div className="mx-auto max-w-md px-6 py-12">
        {/* Wordmark */}
        <p
          className="text-center text-lg font-semibold tracking-wide text-honey-gold"
          style={{ fontFamily: "Georgia, serif" }}
        >
          HoneySwing
        </p>

        {/* Hero */}
        <h1
          className="mt-10 text-center text-3xl font-bold leading-tight text-honey-green"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {coachName
            ? `Coach ${coachName} recommends HoneySwing`
            : "Improve your golf swing with HoneySwing"}
        </h1>

        <p className="mt-4 text-center text-base text-honey-green/70">
          AI-powered swing analysis built for junior golfers
        </p>

        {/* App Store CTA */}
        <div className="mt-10 flex justify-center">
          <a
            href="https://apps.apple.com/app/id6760777790"
            className="inline-block rounded-full bg-honey-gold px-8 py-4 text-lg font-semibold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            Download on the App Store
          </a>
        </div>

        {/* Features */}
        <div className="mt-14 space-y-6">
          <h2
            className="text-center text-xl font-bold text-honey-green"
            style={{ fontFamily: "Georgia, serif" }}
          >
            What is HoneySwing?
          </h2>
          <ul className="space-y-4 text-honey-green/80">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-honey-gold">&#9679;</span>
              <span>
                Record your swing and get instant AI feedback on tempo, posture,
                and mechanics
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-honey-gold">&#9679;</span>
              <span>
                Designed specifically for junior golfers ages 6&ndash;18 and
                their coaches
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-honey-gold">&#9679;</span>
              <span>
                Track progress over time and share highlights with your coach
              </span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <p className="mt-16 text-center text-sm text-honey-green/40">
          &copy; {new Date().getFullYear()} HoneySwing
        </p>
      </div>
    </div>
  );
}
