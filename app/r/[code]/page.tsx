import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

const APP_STORE_URL = 'https://apps.apple.com/app/honeyswing/id6760777790';

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc('get_coach_by_code', { coach_code: code.toLowerCase() });
  const coachName = data?.[0]?.name ?? null;
  const title = coachName ? `Coach ${coachName} recommends HoneySwing` : 'HoneySwing — AI Swing Coach for Junior Golfers';
  const description = coachName ? `${coachName} is giving your family extended access to HoneySwing. AI swing feedback between lessons — free to start.` : 'AI-powered swing analysis built for junior golfers. Free to start.';
  return { title, description, openGraph: { title, description, type: 'website', url: `https://honeyswing.com/r/${code}`, siteName: 'HoneySwing' } };
}

const APPLE_SVG_PATH = 'M15.07 12.95c-.03-2.79 2.27-4.12 2.37-4.19-1.29-1.89-3.3-2.15-4.02-2.18-1.71-.17-3.34 1.01-4.21 1.01-.87 0-2.21-.98-3.63-.96-1.87.03-3.59 1.09-4.55 2.76-1.94 3.36-.5 8.34 1.39 11.07.93 1.33 2.03 2.83 3.48 2.78 1.39-.06 1.92-.9 3.61-.9 1.68 0 2.16.9 3.63.87 1.5-.02 2.46-1.36 3.38-2.7 1.07-1.55 1.51-3.05 1.53-3.13-.03-.01-2.95-1.13-2.98-4.43zM12.24 4.56c.77-.93 1.29-2.22 1.15-3.51-1.11.04-2.45.74-3.25 1.67-.71.82-1.34 2.14-1.17 3.4 1.24.1 2.5-.63 3.27-1.56z';

function AppleIcon() {
  return (
    <svg width="18" height="22" viewBox="0 0 20 24" fill="#0B1D0F">
      <path d={APPLE_SVG_PATH} />
    </svg>
  );
}

function CTAButton({ className = '' }: { className?: string }) {
  return (
    <a href={APP_STORE_URL} className={`flex items-center justify-center gap-3 bg-[#D4A847] hover:bg-[#c49a3d] active:scale-[0.98] transition-all rounded-2xl py-4 px-6 no-underline ${className}`}>
      <AppleIcon />
      <span className="text-[#0B1D0F] text-[16px] font-bold">Download free on the App Store</span>
    </a>
  );
}

function GoldDot() {
  return (
    <div className="w-5 h-5 rounded-full bg-[#D4A847]/20 flex items-center justify-center shrink-0 mt-0.5">
      <div className="w-1.5 h-1.5 rounded-full bg-[#D4A847]" />
    </div>
  );
}

function StepIcon({ type }: { type: 'record' | 'swing' | 'improve' }) {
  return (
    <div className="w-11 h-11 mx-auto mb-2 rounded-xl bg-[#D4A847]/10 flex items-center justify-center">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        {type === 'record' && (
          <>
            <circle cx="12" cy="12" r="8" stroke="#D4A847" strokeWidth="2" />
            <circle cx="12" cy="12" r="4" fill="#D4A847" />
          </>
        )}
        {type === 'swing' && (
          <path d="M4 20L8 12L12 16L16 8L20 4" stroke="#D4A847" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {type === 'improve' && (
          <path d="M12 4L12 20M12 4L8 8M12 4L16 8" stroke="#D4A847" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </div>
  );
}

function Badge({ children }: { children: string }) {
  return <span className="text-[11px] text-white/35 bg-white/[0.05] px-3 py-1.5 rounded-lg">{children}</span>;
}

function SafetyBadge({ children }: { children: string }) {
  return <span className="text-[12px] text-white/30 bg-white/[0.04] px-3 py-1.5 rounded-lg">{children}</span>;
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group">
      <summary className="flex items-center justify-between py-4 border-b border-white/[0.06] cursor-pointer text-[14px] font-semibold text-white/60 list-none [&::-webkit-details-marker]:hidden">
        {question}
        <span className="text-white/30 text-[18px] group-open:rotate-45 transition-transform">+</span>
      </summary>
      <p className="text-[13px] text-white/40 leading-relaxed py-3 border-b border-white/[0.06]">{answer}</p>
    </details>
  );
}

export default async function ReferralPage({ params }: Props) {
  const { code } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc('get_coach_by_code', { coach_code: code.toLowerCase() });
  const coachName = data?.[0]?.name ?? null;
  const initials = coachName ? coachName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) : '??';
  const firstName = coachName ? coachName.split(' ')[0] : null;

  return (
    <>
      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6 bg-gradient-to-t from-[#0B1D0F] via-[#0B1D0F]/95 to-transparent pointer-events-none">
        <CTAButton className="pointer-events-auto w-full max-w-[400px] mx-auto shadow-[0_4px_24px_rgba(212,168,71,0.25)]" />
      </div>

      <main className="min-h-screen">
        {/* ===== HERO ===== */}
        <section className="bg-[#0B1D0F] text-white px-6 pt-8 pb-10">
          <div className="max-w-[480px] mx-auto">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-2 h-2 rounded-full bg-[#D4A847]" />
              <span className="text-[14px] font-semibold text-[#D4A847] tracking-wide">HONEYSWING</span>
            </div>

            {coachName && (
              <div className="flex items-center gap-3 bg-[#D4A847]/[0.06] rounded-xl px-3 py-3 mb-7">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a3a20] to-[#2a5a32] flex items-center justify-center text-[15px] font-bold text-[#D4A847] shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white m-0">Coach {coachName}</p>
                  <p className="text-[12px] text-white/40 m-0">Junior Golf Specialist</p>
                </div>
              </div>
            )}

            <h1 className="text-[32px] font-extrabold leading-[1.12] mb-3">
              {coachName ? (
                <>Coach {firstName} is giving your family <span className="text-[#D4A847]">extended access</span> to HoneySwing</>
              ) : (
                <>Your kid&apos;s swing coach <span className="text-[#D4A847]">in their pocket.</span></>
              )}
            </h1>

            <p className="text-[15px] text-white/55 leading-relaxed mb-8">
              Improve your child&apos;s swing between lessons. Simple feedback after every swing. Free to start — no credit card needed.
            </p>

            <CTAButton className="w-full mb-2" />
            <p className="text-[12px] text-white/30 text-center">Takes less than 60 seconds</p>
          </div>
        </section>

        {/* ===== APP SCREENSHOT ===== */}
        <section className="bg-[#111] px-6 py-10">
          <div className="max-w-[480px] mx-auto">
            <p className="text-[14px] text-white/40 text-center mb-4">
              See your child&apos;s swing, score, and what to fix
            </p>
            <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-3xl overflow-hidden aspect-[9/16] flex items-center justify-center">
             <img src="/images/app-screenshot.png" alt="HoneySwing swing analysis" className="w-full h-auto" />
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              <Badge>Built for junior golfers</Badge>
              <Badge>Coach-backed training</Badge>
              <Badge>Free to start</Badge>
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="bg-[#1A1A1C] px-6 py-10">
          <div className="max-w-[480px] mx-auto">
            <h2 className="text-[13px] font-semibold text-white/40 tracking-wider mb-5 text-center">HOW IT WORKS</h2>
            <div className="bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="grid grid-cols-3">
                <div className="p-5 text-center border-r border-white/[0.06]">
                  <StepIcon type="record" />
                  <p className="text-[11px] font-semibold text-white/40 tracking-wide mb-1">RECORD</p>
                  <p className="text-[12px] text-white/50 leading-snug">Set up your phone</p>
                </div>
                <div className="p-5 text-center border-r border-white/[0.06]">
                  <StepIcon type="swing" />
                  <p className="text-[11px] font-semibold text-white/40 tracking-wide mb-1">SWING</p>
                  <p className="text-[12px] text-white/50 leading-snug">Take a swing</p>
                </div>
                <div className="p-5 text-center">
                  <StepIcon type="improve" />
                  <p className="text-[11px] font-semibold text-white/40 tracking-wide mb-1">IMPROVE</p>
                  <p className="text-[12px] text-white/50 leading-snug">Get instant feedback</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== BENEFITS ===== */}
        <section className="bg-[#1A1A1C] px-6 pb-10">
          <div className="max-w-[480px] mx-auto space-y-3">
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5">
              <p className="text-[15px] font-bold text-white mb-1">Better feedback between lessons</p>
              <p className="text-[13px] text-white/45 leading-relaxed">Know what to fix after every swing — not next lesson.</p>
            </div>
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5">
              <p className="text-[15px] font-bold text-white mb-1">Practice with purpose</p>
              <p className="text-[13px] text-white/45 leading-relaxed">Stop guessing. Practice the right thing.</p>
            </div>
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5">
              <p className="text-[15px] font-bold text-white mb-1">See your kid&apos;s progress</p>
              <p className="text-[13px] text-white/45 leading-relaxed">See real progress over time.</p>
            </div>
          </div>
        </section>

        {/* ===== COACH SECTION ===== */}
        {coachName && (
          <section className="bg-[#0B1D0F] px-6 py-10">
            <div className="max-w-[480px] mx-auto">
              <div className="bg-[#D4A847]/[0.06] border border-[#D4A847]/[0.12] rounded-2xl p-6">
                <h2 className="text-[13px] font-semibold text-white/40 tracking-wider mb-5">
                  THROUGH COACH {firstName?.toUpperCase()}&apos;S PROGRAM
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <GoldDot />
                    <p className="text-[14px] text-white/60">Extended free access to get your family started</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <GoldDot />
                    <p className="text-[14px] text-white/60">Reinforces what Coach {firstName} teaches</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <GoldDot />
                    <p className="text-[14px] text-white/60">Built for junior golfers</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===== SAFETY BADGES ===== */}
        <section className={`${coachName ? 'bg-[#1A1A1C]' : 'bg-[#0B1D0F]'} px-6 py-8`}>
          <div className="max-w-[480px] mx-auto flex flex-wrap gap-2 justify-center">
            <SafetyBadge>Built for junior golfers</SafetyBadge>
            <SafetyBadge>No ads</SafetyBadge>
            <SafetyBadge>No social features</SafetyBadge>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className={`${coachName ? 'bg-[#0B1D0F]' : 'bg-[#1A1A1C]'} px-6 py-10`}>
          <div className="max-w-[480px] mx-auto">
            <h2 className="text-[13px] font-semibold text-white/40 tracking-wider mb-4 text-center">QUESTIONS</h2>
            <div className="border-t border-white/[0.06]">
              <FAQ question="Is it free to start?" answer="Yes — you can start right away with no credit card." />
              <FAQ question="Does this work on my phone?" answer="Works on iPhone — just set it up and swing." />
              <FAQ
                question={coachName ? `Is this connected to Coach ${firstName}?` : 'How does the coach connection work?'}
                answer={coachName ? `Yes — this version is connected to Coach ${firstName}.` : "When you download through a coach's link, you're automatically connected."}
              />
            </div>
          </div>
        </section>

      

        <div className="h-28 bg-[#0B1D0F]" />
      </main>
    </>
  );
}
