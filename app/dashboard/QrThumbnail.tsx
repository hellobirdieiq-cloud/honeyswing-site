"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

export default function QrThumbnail({ url }: { url: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 120,
      margin: 2,
      color: { dark: "#1B3A2D", light: "#FDF8F0" },
    }).then(setDataUrl);
  }, [url]);

  if (!dataUrl) {
    return (
      <div className="h-[120px] w-[120px] animate-pulse rounded-lg bg-honey-green/10" />
    );
  }

  return (
    <img
      src={dataUrl}
      alt="QR code for your referral link"
      className="h-[120px] w-[120px] rounded-lg"
    />
  );
}
