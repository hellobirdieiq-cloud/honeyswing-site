"use client";

import { useEffect, useState } from "react";

const COACHING_TIPS = [
  "Leave QR cards at the front desk or check-in area",
  "Hand one to each parent after a lesson",
  "Include your referral link in follow-up emails",
  "Mention HoneySwing during group clinics",
];

export default function TipRotator() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % COACHING_TIPS.length);
        setVisible(true);
      }, 400);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[3rem] py-2">
      <p className="text-xs font-semibold tracking-wide text-honey-green/40 uppercase">
        Tip
      </p>
      <p
        className={`text-sm text-honey-green/70 italic transition-opacity duration-400 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {COACHING_TIPS[index]}
      </p>
    </div>
  );
}
