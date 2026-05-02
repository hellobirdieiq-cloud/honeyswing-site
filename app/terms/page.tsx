export const metadata = {
  title: "Terms of Use — HoneySwing",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#111] text-white px-6 py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-[#F5A623] mb-8">Terms of Use</h1>
      <p className="text-sm text-gray-400 mb-6">Last updated: April 3, 2026</p>

      <section className="space-y-4 text-gray-300 text-sm leading-relaxed">
        <p>By using HoneySwing, you agree to these terms.</p>

        <h2 className="text-lg font-semibold text-white pt-4">1. Service</h2>
        <p>HoneySwing provides AI-powered golf swing analysis for junior golfers. The app is intended for educational and recreational use. Analysis results are not a substitute for professional coaching instruction.</p>

        <h2 className="text-lg font-semibold text-white pt-4">2. Accounts</h2>
        <p>You may create an account using a parent or guardian email address. You are responsible for maintaining the security of your account. Users under 18 must have parental consent.</p>

        <h2 className="text-lg font-semibold text-white pt-4">3. Subscriptions</h2>
        <p>HoneySwing Pro is available as a monthly ($9.99/mo) or annual ($59.99/yr) subscription. Subscriptions are billed through Apple and managed via your App Store account. You may cancel at any time through your Apple ID settings. Refunds are handled by Apple per their refund policy.</p>

        <h2 className="text-lg font-semibold text-white pt-4">4. User Content</h2>
        <p>Swing videos and photos are processed locally on your device. Pose and grip data derived from your videos may be stored in our database to provide analysis history. You may delete your account and all associated data at any time from the app settings.</p>

        <h2 className="text-lg font-semibold text-white pt-4">5. Prohibited Use</h2>
        <p>You may not reverse-engineer the app, use it for any unlawful purpose, or attempt to access other users&apos; data.</p>

        <h2 className="text-lg font-semibold text-white pt-4">6. Limitation of Liability</h2>
        <p>HoneySwing is provided &quot;as is&quot; without warranty. We are not liable for any injuries, damages, or losses arising from use of the app or reliance on its analysis.</p>

        <h2 className="text-lg font-semibold text-white pt-4">7. Changes</h2>
        <p>We may update these terms. Continued use after changes constitutes acceptance.</p>

        <h2 className="text-lg font-semibold text-white pt-4">8. Contact</h2>
        <p>Questions? Email sammazzeo31@gmail.com.</p>
      </section>
    </main>
  );
}
