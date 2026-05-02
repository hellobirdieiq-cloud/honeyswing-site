export const metadata = {
  title: "Privacy Policy — HoneySwing",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#111] text-white px-6 py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-[#F5A623] mb-8">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-6">Last updated: May 1, 2026</p>

      <section className="space-y-4 text-gray-300 text-sm leading-relaxed">
        <p>HoneySwing (&quot;we,&quot; &quot;our,&quot; &quot;us&quot;) is a golf swing analysis app for junior golfers under the age of 13. We take privacy seriously — especially because our users are children. This Privacy Policy explains what data we collect, how we use it, your rights as a parent, and how we protect your child&apos;s information.</p>

        <p><strong>This is a parent-facing policy.</strong> HoneySwing accounts are created and owned by parents or legal guardians. Children under 13 are not a party to this agreement.</p>

        <p>Your use of the App is also governed by our <a href="/terms" className="text-[#F5A623] hover:underline">Terms of Service</a>.</p>

        <h2 className="text-lg font-semibold text-white pt-4">1. COPPA Compliance</h2>
        <p>HoneySwing complies with the U.S. Children&apos;s Online Privacy Protection Act (COPPA, 15 U.S.C. §§ 6501–6506) and the FTC&apos;s COPPA Rule (16 CFR Part 312).</p>
        <p>Account creation requires parental consent. By creating an account, the parent or legal guardian confirms they are at least 18 years old and consents to our collection and use of their child&apos;s data as described in this policy.</p>
        <p>Children cannot create accounts directly within the App.</p>

        <h2 className="text-lg font-semibold text-white pt-4">2. Information We Collect</h2>
        <p><strong>Account data.</strong> Email address (parent/guardian), display name, handedness (left or right), and account ID.</p>
        <p><strong>Swing data.</strong> Pose landmarks, grip features, swing metrics, and analysis results derived from videos your child records. We do NOT collect raw video.</p>
        <p><strong>Device data.</strong> App version and device model, used only for debugging and crash reporting.</p>
        <p><strong>Subscription data.</strong> Subscription status via RevenueCat. We do not see, store, or process payment card details.</p>
        <p><strong>Coach referral data.</strong> If your child uses a coach referral code, we record the connection between the account and the coach.</p>

        <h2 className="text-lg font-semibold text-white pt-4">3. Information We Do NOT Collect</h2>
        <ol className="list-decimal pl-6 space-y-1">
          <li>We do NOT collect or store raw video. Recorded videos remain on your child&apos;s device.</li>
          <li>We do NOT collect location data.</li>
          <li>We do NOT collect contacts, browsing history, or advertising identifiers.</li>
          <li>We do NOT use third-party analytics or tracking tools on child accounts.</li>
          <li>We do NOT serve advertising to children.</li>
          <li>We do NOT sell or share data with advertisers, data brokers, or marketing partners.</li>
        </ol>

        <h2 className="text-lg font-semibold text-white pt-4">4. How We Use Data</h2>
        <p>We use child data only to:</p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Provide swing analysis and coaching feedback.</li>
          <li>Track progress over time.</li>
          <li>Connect your child with their coach (if a referral code is used).</li>
          <li>Manage subscriptions.</li>
          <li>Improve the App&apos;s analysis quality through aggregated statistical data that does not identify or relate to any individual child.</li>
        </ol>
        <p>We do NOT use child data to:</p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Target or personalize advertising.</li>
          <li>Build commercial profiles.</li>
          <li>Run A/B tests, behavioral experiments, or engagement-maximization models on individual children.</li>
          <li>Sell, rent, or share with marketing partners.</li>
        </ol>

        <h2 className="text-lg font-semibold text-white pt-4">5. On-Device Processing</h2>
        <p>Swing videos are processed on your child&apos;s device using on-device AI (MediaPipe). Raw video does not leave the device. Only derived pose and grip data is transmitted to our servers for analysis history and progress tracking.</p>

        <h2 className="text-lg font-semibold text-white pt-4">6. Third-Party Services</h2>
        <p>We rely on the following service providers to operate the App. Each processes data only as needed to provide their service and is bound by their own privacy policies and our agreements with them.</p>
        <p><strong>Supabase.</strong> Database storage and authentication. Stores account data and derived swing data with encrypted storage and row-level security. Each user can only access their own data.</p>
        <p><strong>RevenueCat.</strong> Subscription management. Receives subscription status only. Does not receive child personal information.</p>
        <p><strong>Anthropic.</strong> Grip classification. Receives only hand landmark coordinates. Does not receive images, video, account information, or identifying information.</p>
        <p>We do not authorize any third-party service to use child data for their own purposes, including advertising, model training, or commercial profiling.</p>

        <h2 className="text-lg font-semibold text-white pt-4">7. Your Rights as a Parent (COPPA)</h2>
        <p>You have the right to:</p>
        <ol className="list-decimal pl-6 space-y-1">
          <li><strong>Review</strong> the personal information we have collected about your child. Request via <a href="mailto:hello@honeyswing.com" className="text-[#F5A623] hover:underline">hello@honeyswing.com</a>.</li>
          <li><strong>Delete</strong> your child&apos;s data at any time using the in-app account deletion in Settings. Deletion is permanent and immediate.</li>
          <li><strong>Refuse further collection.</strong> Stop using the App and delete the account; we will not collect further data.</li>
          <li><strong>Receive notice</strong> of material changes to this policy before they take effect (see Section 13).</li>
          <li><strong>Receive notice of data breach</strong> affecting your child&apos;s data (see Section 11).</li>
          <li><strong>Revoke coach access</strong> at any time in Settings.</li>
        </ol>

        <h2 className="text-lg font-semibold text-white pt-4">8. Coach Referral Codes</h2>
        <p>If your child uses a coach referral code, the named coach receives access to your child&apos;s swing metrics, scores, analysis outputs, and pose/grip data — within the App only — for the purpose of providing coaching feedback.</p>
        <p>The coach does NOT receive: your email, billing information, raw video, or any data unrelated to swing analysis.</p>
        <p>Each coach must accept a separate Coach Agreement requiring confidentiality, no export or social media sharing of child data, and compliance with COPPA.</p>
        <p>You may revoke coach access at any time in Settings. See our <a href="/terms" className="text-[#F5A623] hover:underline">Terms of Service</a> Section 8 for full coach-relationship terms.</p>

        <h2 className="text-lg font-semibold text-white pt-4">9. Data Security</h2>
        <p>Your data is stored using Supabase, which provides encrypted storage and row-level security. Each user can only access their own data. We do not store passwords — authentication is handled via magic-link email.</p>
        <p>We maintain administrative, technical, and physical safeguards intended to protect personal information against unauthorized access, disclosure, alteration, or destruction.</p>
        <p>No method of transmission or storage is 100% secure. While we work to protect your child&apos;s data, we cannot guarantee absolute security.</p>

        <h2 className="text-lg font-semibold text-white pt-4">10. Data Retention &amp; Deletion</h2>
        <p>We retain child data only as long as the account is active. When you delete the account:</p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Your child&apos;s account profile is permanently removed.</li>
          <li>All swing data, pose landmarks, grip features, and analysis history are permanently deleted.</li>
          <li>Coach access to your child&apos;s data is severed.</li>
          <li>Aggregated statistical data already incorporated into our analysis models cannot feasibly be retroactively removed and, by definition, does not identify or relate to your child individually.</li>
        </ol>
        <p>You can delete your account at any time directly in the App by going to Settings → Delete Account. If you have any issues, contact <a href="mailto:hello@honeyswing.com" className="text-[#F5A623] hover:underline">hello@honeyswing.com</a>.</p>

        <h2 className="text-lg font-semibold text-white pt-4">11. Data Breach Notification</h2>
        <p>If we confirm a security breach affecting your child&apos;s data, we will notify you within seventy-two (72) hours of confirmation. The notice will include:</p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>The nature and approximate scope of the breach.</li>
          <li>The categories of data affected.</li>
          <li>The steps we have taken or are taking in response.</li>
          <li>Recommended steps you can take to protect your child.</li>
          <li>A point of contact for further questions.</li>
        </ol>
        <p>We will deliver this notice via the email on file and, where appropriate, via in-app notice. This commitment is in addition to, not in place of, any statutory notification obligations under federal or state law.</p>

        <h2 className="text-lg font-semibold text-white pt-4">12. Massachusetts Provisions</h2>
        <p>If you reside in Massachusetts:</p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Nothing in this Privacy Policy limits any rights you may have under the Massachusetts Consumer Protection Act, M.G.L. c. 93A.</li>
          <li>We maintain administrative, technical, and physical safeguards intended to comply with the Massachusetts Standards for the Protection of Personal Information of Residents of the Commonwealth, 201 CMR 17.00.</li>
          <li>If a Massachusetts data security incident occurs that triggers M.G.L. c. 93H notification requirements, we will notify you and the Massachusetts Attorney General&apos;s office as required by that statute.</li>
        </ol>

        <h2 className="text-lg font-semibold text-white pt-4">13. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. For material changes (changes that affect your rights or how we collect, use, or share child data), we will:</p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Notify you by email or in-app notice at least thirty (30) days before the changes take effect.</li>
          <li>Update the &quot;Last updated&quot; date at the top of this policy.</li>
          <li>Treat continued use after the effective date as acceptance.</li>
        </ol>
        <p>If you do not agree to a material change, you may delete the account before the effective date.</p>

        <h2 className="text-lg font-semibold text-white pt-4">14. Contact</h2>
        <p>Questions about this policy, requests to review or delete your child&apos;s data, or notices under this policy:</p>
        <p>Email: <a href="mailto:hello@honeyswing.com" className="text-[#F5A623] hover:underline">hello@honeyswing.com</a></p>
        <p>For account deletion: use the in-app Settings menu.</p>
      </section>
    </main>
  );
}
