export const metadata = {
  title: "Privacy Policy — HoneySwing",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#111] text-white px-6 py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-[#F5A623] mb-8">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-6">Last updated: April 3, 2026</p>

      <section className="space-y-4 text-gray-300 text-sm leading-relaxed">
        <p>HoneySwing is built for junior golfers and their families. We take privacy seriously, especially for young athletes.</p>

        <h2 className="text-lg font-semibold text-white pt-4">1. Data We Collect</h2>
        <p><strong>Account data:</strong> Email address (parent/guardian), user ID.</p>
        <p><strong>Swing data:</strong> Pose landmarks, grip features, swing metrics, and analysis results derived from your videos.</p>
        <p><strong>Device data:</strong> App version, device model (for debugging only).</p>
        <p><strong>Purchase data:</strong> Subscription status via RevenueCat. We do not see or store payment details.</p>

        <h2 className="text-lg font-semibold text-white pt-4">2. Data We Do NOT Collect</h2>
        <p>We do not collect location data, contacts, browsing history, or advertising identifiers. We do not sell or share your data with advertisers.</p>

        <h2 className="text-lg font-semibold text-white pt-4">3. Video Processing</h2>
        <p>Swing videos are processed on your device using on-device AI (MediaPipe). Raw video is not uploaded to our servers. Only derived pose and grip data is stored.</p>

        <h2 className="text-lg font-semibold text-white pt-4">4. How We Use Your Data</h2>
        <p>To provide swing analysis and track progress over time. To connect you with your coach (if you use a coach referral code). To manage your subscription.</p>

        <h2 className="text-lg font-semibold text-white pt-4">5. Third-Party Services</h2>
        <p><strong>Supabase:</strong> Database and authentication. <strong>RevenueCat:</strong> Subscription management. <strong>Anthropic:</strong> Grip classification (receives only hand landmark coordinates, not images or video). These services process data per their own privacy policies.</p>

        <h2 className="text-lg font-semibold text-white pt-4">6. Children&apos;s Privacy</h2>
        <p>HoneySwing is designed for junior golfers. Account creation requires a parent or guardian email. We do not knowingly collect personal information from children without parental consent.</p>

        <h2 className="text-lg font-semibold text-white pt-4">7. Data Deletion</h2>
        <p>You can delete your account and all associated data at any time from Settings within the app. Deletion is permanent and immediate.</p>

        <h2 className="text-lg font-semibold text-white pt-4">8. Contact</h2>
        <p>Questions about your data? Email hello@honeyswing.com.</p>
      </section>
    </main>
  );
}
