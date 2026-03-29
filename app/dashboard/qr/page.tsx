"use client";

import { supabase } from "@/lib/supabase/client";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

export default function QRPage() {
  const [coachName, setCoachName] = useState<string | null>(null);
  const [coachCode, setCoachCode] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("coaches")
        .select("code, name")
        .single();

      if (data) {
        setCoachName(data.name);
        setCoachCode(data.code);
        const url = `https://honeyswing.com/r/${data.code}`;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 200,
          margin: 2,
          color: { dark: "#1B3A2D", light: "#FDF8F0" },
        });
        setQrDataUrl(dataUrl);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-honey-cream">
        <p className="text-honey-green/60">Loading...</p>
      </div>
    );
  }

  if (!coachCode || !coachName) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-honey-cream">
        <p className="text-honey-green/60">
          No coach profile found. Please contact support.
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; background: white; }
          .print-card {
            width: 3.5in;
            height: 2in;
            margin: 0 auto;
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="min-h-screen bg-honey-cream">
        {/* Screen-only header */}
        <div className="no-print px-6 pt-10 text-center">
          <h1
            className="text-2xl font-bold text-honey-green"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Your QR Card
          </h1>
          <p className="mt-2 text-honey-green/60">
            Print and leave at the front desk
          </p>
        </div>

        {/* Card preview */}
        <div className="flex justify-center px-6 py-10">
          <div
            className="print-card flex w-[3.5in] flex-col items-center justify-center rounded-lg bg-honey-green px-6 py-5"
            style={{ height: "2in" }}
          >
            {/* Gold accent line */}
            <div className="mb-3 h-0.5 w-12 bg-honey-gold" />

            {/* Wordmark */}
            <p
              className="text-sm font-semibold tracking-wide text-honey-gold"
              style={{ fontFamily: "Georgia, serif" }}
            >
              HoneySwing
            </p>

            {/* QR code */}
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt={`QR code for honeyswing.com/r/${coachCode}`}
                className="mt-2 h-20 w-20 rounded"
              />
            )}

            {/* Coach name */}
            <p
              className="mt-2 text-sm font-semibold text-honey-cream"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Coach {coachName}
            </p>

            {/* CTA */}
            <p className="mt-1 text-xs text-honey-cream/60">
              Scan to download
            </p>
          </div>
        </div>

        {/* Print button */}
        <div className="no-print flex justify-center pb-10">
          <button
            onClick={() => window.print()}
            className="rounded-full bg-honey-gold px-8 py-3 font-semibold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            Print Cards
          </button>
        </div>
      </div>
    </>
  );
}
