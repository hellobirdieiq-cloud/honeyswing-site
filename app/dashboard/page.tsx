import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import CopyLinkButton from "./CopyLinkButton";
import QrThumbnail from "./QrThumbnail";
import TipRotator from "./TipRotator";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Query 1: Coach profile
  const { data: coach, error: coachError } = await supabase
    .from("coaches")
    .select("name, code, revenue_share_pct, revenue_cap_cents")
    .single();

  if (coachError) {
    console.error("Failed to fetch coach profile:", coachError);
  }

  if (!coach) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-honey-cream">
        <p className="text-honey-green/60">
          No coach profile found. Please contact support.
        </p>
      </div>
    );
  }

  // Query 2: All swings (RLS auto-filters to coach's referrals)
  const { data: swings, error: swingsError } = await supabase
    .from("swings")
    .select("user_id, score, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (swingsError) {
    console.error("Failed to fetch swings:", swingsError);
  }

  const allSwings = swings ?? [];

  // --- Derived metrics ---

  const uniqueUsers = new Set(allSwings.map((s) => s.user_id));
  const kidsReached = uniqueUsers.size;
  const swingsAnalyzed = allSwings.length;

  // Most active day of week
  const dayCounts: Record<string, number> = {};
  for (const s of allSwings) {
    const day = new Date(s.created_at).toLocaleDateString("en-US", {
      weekday: "long",
    });
    dayCounts[day] = (dayCounts[day] ?? 0) + 1;
  }
  const mostActiveDay =
    Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  // Earnings display
  const revSharePct = coach.revenue_share_pct ?? 100;
  const revCapDollars = ((coach.revenue_cap_cents ?? 600000) / 100).toLocaleString();

  let dealTerms: string;
  if (revSharePct >= 100) {
    dealTerms = `Your deal: 100% of first-year revenue up to $${revCapDollars}, then 25% ongoing.`;
  } else {
    dealTerms = `${revSharePct}% of revenue, ongoing.`;
  }

  // Trailing 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const weekSwings = allSwings.filter(
    (s) => new Date(s.created_at) >= sevenDaysAgo
  );
  const weeklyKids = new Set(weekSwings.map((s) => s.user_id)).size;

  // Active today
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const activeToday = new Set(
    allSwings
      .filter((s) => new Date(s.created_at) >= todayStart)
      .map((s) => s.user_id)
  ).size;

  // Came back this week (users with swings on 2+ distinct calendar days in trailing 7 days)
  const userDays = new Map<string, Set<string>>();
  for (const s of weekSwings) {
    const uid = s.user_id;
    if (!uid) continue;
    const dayKey = new Date(s.created_at).toISOString().slice(0, 10);
    if (!userDays.has(uid)) userDays.set(uid, new Set());
    userDays.get(uid)!.add(dayKey);
  }
  const cameBackThisWeek = [...userDays.values()].filter(
    (days) => days.size >= 2
  ).length;

  // Player anonymization: assign "Player N" by order of first swing
  const firstSwingByUser = new Map<string, Date>();
  for (const s of allSwings) {
    if (!s.user_id) continue;
    const d = new Date(s.created_at);
    const existing = firstSwingByUser.get(s.user_id);
    if (!existing || d < existing) {
      firstSwingByUser.set(s.user_id, d);
    }
  }
  const userOrder = [...firstSwingByUser.entries()]
    .sort((a, b) => a[1].getTime() - b[1].getTime())
    .map(([uid]) => uid);
  const userLabel = new Map(
    userOrder.map((uid, i) => [uid, `Player ${i + 1}`])
  );

  // Recent activity: last 20 swings
  const recentSwings = allSwings.slice(0, 20).map((s) => ({
    date: new Date(s.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    player: s.user_id ? (userLabel.get(s.user_id) ?? "Unknown") : "Anonymous",
    score: s.score,
  }));

  const referralUrl = `https://honeyswing.com/r/${coach.code}`;

  return (
    <div className="min-h-screen bg-honey-cream">
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <p
            className="text-lg font-semibold tracking-wide text-honey-gold"
            style={{ fontFamily: "Georgia, serif" }}
          >
            HoneySwing
          </p>
          <h1
            className="mt-1 text-2xl font-bold text-honey-green"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Welcome back, Coach {coach.name}
          </h1>
        </div>

        {/* 1. Magic Moment Banner */}
        <section className="rounded-2xl bg-honey-gold px-6 py-5 text-center">
          {weeklyKids > 0 ? (
            <p
              className="text-lg font-bold text-honey-green"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {weeklyKids} {weeklyKids === 1 ? "kid" : "kids"} tried
              HoneySwing from your referrals this week!
            </p>
          ) : (
            <>
              <p
                className="text-lg font-bold text-honey-green"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Your coaching journey with HoneySwing starts here
              </p>
              <p className="mt-1 text-sm text-honey-green/80">
                Hand out your QR at your next lesson to see your first players
                here
              </p>
            </>
          )}
        </section>

        {/* 2. Metric Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Kids Reached */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold tracking-wide text-honey-green/40 uppercase">
              Kids Reached
            </p>
            <p
              className="mt-1 text-3xl font-bold text-honey-green"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {kidsReached}
            </p>
            {kidsReached === 0 && (
              <p className="mt-1 text-sm text-honey-green/50">
                Waiting for your first player
              </p>
            )}
          </div>

          {/* Swings Analyzed */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold tracking-wide text-honey-green/40 uppercase">
              Swings Analyzed
            </p>
            <p
              className="mt-1 text-3xl font-bold text-honey-green"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {swingsAnalyzed}
            </p>
            {swingsAnalyzed === 0 && (
              <p className="mt-1 text-sm text-honey-green/50">
                Share your link to get started
              </p>
            )}
          </div>

          {/* Most Active Day */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold tracking-wide text-honey-green/40 uppercase">
              Most Active Day
            </p>
            <p
              className="mt-1 text-3xl font-bold text-honey-green"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {mostActiveDay}
            </p>
            {allSwings.length === 0 && (
              <p className="mt-1 text-sm text-honey-green/50">
                Too early to tell
              </p>
            )}
          </div>

          {/* Estimated Earnings */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold tracking-wide text-honey-green/40 uppercase">
              Estimated Earnings
            </p>
            <p
              className="mt-1 text-3xl font-bold text-honey-green"
              style={{ fontFamily: "Georgia, serif" }}
            >
              $0
            </p>
            <p className="mt-1 text-sm text-honey-green/50">
              Earnings begin when subscriptions launch.
            </p>
            <p className="mt-2 text-xs text-honey-green/40">{dealTerms}</p>
          </div>
        </section>

        {/* 3. Referral Section */}
        <section className="rounded-2xl bg-white p-6 shadow-sm space-y-5">
          <h2
            className="text-lg font-bold text-honey-green"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Share HoneySwing
          </h2>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            {/* Link + Copy */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={referralUrl}
                  className="w-full rounded-lg border border-honey-green/10 bg-honey-cream px-3 py-2 text-sm text-honey-green"
                />
                <CopyLinkButton url={referralUrl} />
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard/qr"
                  className="text-sm font-semibold text-honey-gold hover:underline"
                >
                  Print QR Cards &rarr;
                </Link>
              </div>
            </div>

            {/* QR Thumbnail */}
            <Link href="/dashboard/qr">
              <QrThumbnail url={referralUrl} />
            </Link>
          </div>

          <TipRotator />
        </section>

        {/* 4. Your Players This Week */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2
            className="text-lg font-bold text-honey-green"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Your Players This Week
          </h2>
          <div className="mt-4 flex gap-8">
            <div>
              <p
                className="text-3xl font-bold text-honey-green"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {activeToday}
              </p>
              <p className="text-sm text-honey-green/50">Active today</p>
            </div>
            <div>
              <p
                className="text-3xl font-bold text-honey-green"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {cameBackThisWeek}
              </p>
              <p className="text-sm text-honey-green/50">Came back this week</p>
            </div>
          </div>
          {activeToday === 0 && cameBackThisWeek === 0 && (
            <p className="mt-3 text-sm text-honey-green/50">
              No activity yet this week — a great time to share your link!
            </p>
          )}
        </section>

        {/* 5. Recent Activity Table */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2
            className="text-lg font-bold text-honey-green"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Recent Activity
          </h2>

          {recentSwings.length === 0 ? (
            <p className="mt-4 text-sm text-honey-green/50">
              Your first referral&apos;s swings will show up here.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-honey-green/10 text-honey-green/40">
                    <th className="pb-2 pr-4 font-semibold">Date</th>
                    <th className="pb-2 pr-4 font-semibold">Player</th>
                    <th className="pb-2 font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSwings.map((s, i) => (
                    <tr
                      key={i}
                      className="border-b border-honey-green/5 text-honey-green"
                    >
                      <td className="py-2 pr-4">{s.date}</td>
                      <td className="py-2 pr-4">{s.player}</td>
                      <td className="py-2">
                        {s.score != null ? s.score : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
