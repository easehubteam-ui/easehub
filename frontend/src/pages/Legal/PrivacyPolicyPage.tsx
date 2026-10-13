import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, CalendarDays, ShieldCheck } from 'lucide-react';

const policySections = [
  { id: 'scope', title: '1. About this policy' },
  { id: 'information', title: '2. Information we collect' },
  { id: 'use', title: '3. How we use information' },
  { id: 'sharing', title: '4. When information is shared' },
  { id: 'google', title: '5. Google sign-in' },
  { id: 'location', title: '6. Location and maps' },
  { id: 'payments', title: '7. Payments and receipts' },
  { id: 'storage', title: '8. Cookies and browser storage' },
  { id: 'retention', title: '9. Retention and security' },
  { id: 'choices', title: '10. Your choices and requests' },
  { id: 'children', title: '11. Children and young users' },
  { id: 'changes', title: '12. Changes to this policy' },
  { id: 'contact', title: '13. Contact EaseHub' },
];

const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Privacy Policy | EaseHub';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#171A18]">
      <header className="border-b border-[#E5E1D6] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#225944] hover:text-[#184232]">
            <ArrowLeft size={17} aria-hidden="true" />
            Back to EaseHub
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-[#E5E1D6] bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-11">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[#EECA3A]/20 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D9E5DE] bg-[#F2F7F3] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#225944]">
              <ShieldCheck size={15} aria-hidden="true" />
              Your privacy at EaseHub
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[#225944] sm:text-5xl">Privacy Policy</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#55554E] sm:text-base">
              This policy explains what information EaseHub handles when you browse listings, create an account,
              book student-living services, contact support, or make a payment.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#6B6B63]">
              <CalendarDays size={15} aria-hidden="true" />
              Last updated: 13 October 2026
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
          <aside className="rounded-2xl border border-[#E5E1D6] bg-white p-5 lg:sticky lg:top-6">
            <h2 className="mb-4 text-xs font-extrabold uppercase tracking-[0.14em] text-[#6B6B63]">On this page</h2>
            <nav aria-label="Privacy policy sections" className="max-h-[60vh] space-y-1 overflow-y-auto pr-1">
              {policySections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-lg px-3 py-2 text-xs font-semibold leading-5 text-[#404944] transition hover:bg-[#F3F4F0] hover:text-[#225944] focus:outline-none focus:ring-2 focus:ring-[#225944]"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <article className="min-w-0 rounded-2xl border border-[#E5E1D6] bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-9">
            <section id="scope" className="scroll-mt-8 border-b border-[#EDEEEB] pb-7">
              <h2 className="text-xl font-extrabold text-[#225944]">1. About this policy</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                EaseHub (“EaseHub”, “we”, “us” or “our”) provides a platform for discovering and requesting
                student accommodation, meals, laundry and other local services. This policy applies to our website
                and related account, booking, payment, community and support features. It describes our current
                practices and should be read together with any notices shown when you use a particular feature.
              </p>
            </section>

            <section id="information" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">2. Information we collect</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">Depending on how you use EaseHub, information may include:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-[#55554E] marker:text-[#225944]">
                <li><strong className="text-[#171A18]">Account and profile details:</strong> name, email address, phone number, campus or college, and profile details you choose to provide.</li>
                <li><strong className="text-[#171A18]">Authentication details:</strong> information needed to create and secure your account. When you choose Google sign-in, Google provides account details such as your name, email address and, if available, profile image. EaseHub does not receive your Google password.</li>
                <li><strong className="text-[#171A18]">Bookings and service details:</strong> selected listing or service, booking status, dates, delivery or accommodation address, room or service notes, and related communications.</li>
                <li><strong className="text-[#171A18]">Payment verification details:</strong> payment amount and status, UPI transaction reference (UTR), and any payment receipt or screenshot you submit for manual verification.</li>
                <li><strong className="text-[#171A18]">Messages and content:</strong> support requests, community chat messages, reviews, ratings, and other information you submit through the platform.</li>
                <li><strong className="text-[#171A18]">Technical information:</strong> information necessary to operate, secure and troubleshoot the website may be processed by our hosting and backend providers, such as request, device/browser and diagnostic data.</li>
              </ul>
            </section>

            <section id="use" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">3. How we use information</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">We use information as needed to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-[#55554E] marker:text-[#225944]">
                <li>create and manage accounts, authenticate users, and maintain account security;</li>
                <li>show relevant accommodation and services and coordinate bookings or service requests;</li>
                <li>send booking, payment-verification, account and support updates;</li>
                <li>review UPI payment references and uploaded receipts;</li>
                <li>operate community, messaging, review and support features;</li>
                <li>protect the platform, investigate misuse, resolve disputes, and comply with applicable legal obligations; and</li>
                <li>maintain, troubleshoot and improve the reliability of EaseHub.</li>
              </ul>
            </section>

            <section id="sharing" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">4. When information is shared</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                We share information only as needed for the purposes described here, including with:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-[#55554E] marker:text-[#225944]">
                <li><strong className="text-[#171A18]">Service providers and property or service partners:</strong> the details needed to respond to a booking or fulfill a requested service, such as your contact details, selected service and relevant address or instructions.</li>
                <li><strong className="text-[#171A18]">Platform providers:</strong> providers that support hosting, authentication, database, storage, maps, communications or security. They process information to provide their services to EaseHub.</li>
                <li><strong className="text-[#171A18]">EaseHub support and administrators:</strong> authorized personnel may access relevant booking, account, message or payment-proof details to provide support, moderate the community or verify a payment.</li>
                <li><strong className="text-[#171A18]">Other users:</strong> content you post in community features or submit as a public review may be visible to other users. Do not post sensitive personal or payment information there.</li>
                <li><strong className="text-[#171A18]">Legal and safety purposes:</strong> where disclosure is required by law or is reasonably necessary to protect users, the public, EaseHub or the platform.</li>
              </ul>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                We do not give service partners access to account information unrelated to their request. Third-party
                services may process information under their own privacy terms.
              </p>
            </section>

            <section id="google" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">5. Google sign-in</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                If you choose “Continue with Google”, Google shares the account information and permissions shown
                on its consent screen, which may include your name, email address and profile picture. We use these
                details to authenticate you and create or maintain your EaseHub profile. Google handles the sign-in
                itself; EaseHub does not see your Google password. You can review or revoke EaseHub’s access in your
                Google Account security settings. Google’s own privacy policy also applies to Google’s processing.
              </p>
            </section>

            <section id="location" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">6. Location and maps</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                When you search for or select a location on a map, the search text or selected map coordinates and
                address details may be sent to OpenStreetMap’s Nominatim service to find or describe that location.
                Map tiles may also be requested from OpenStreetMap. We use the resulting location details to show
                listings and coordinate services. Map providers process those requests under their own terms and
                privacy policies. You can avoid providing a precise address unless it is needed for a booking or service.
              </p>
            </section>

            <section id="payments" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">7. Payments and receipts</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                EaseHub currently supports UPI-based payments and manual payment verification. If you pay through a
                UPI app, that app handles the payment credentials and transaction. EaseHub may receive the payment
                amount, UTR/reference, status and any receipt screenshot you upload so our team can match and verify
                the payment. Never send a UPI PIN, password or one-time passcode to EaseHub or include it in a receipt
                upload. Your bank and UPI provider’s privacy terms apply to their processing.
              </p>
            </section>

            <section id="storage" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">8. Cookies and browser storage</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                The website and authentication provider use necessary browser storage and session-related cookies to
                keep you signed in, maintain security and complete sign-in redirects. Your browser may also store
                basic account/session state so the site can restore your session. Blocking or clearing this storage
                may sign you out or prevent some features from working. This page does not describe cookies used by
                third-party sites you choose to visit.
              </p>
            </section>

            <section id="retention" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">9. Retention and security</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                We retain information for as long as needed to provide the service, maintain account and booking
                records, verify payments, resolve disputes, protect the platform, and meet applicable legal
                requirements. Retention periods can differ by information type. We use access controls and
                security measures intended to protect information, but no internet transmission or storage system
                can be guaranteed completely secure.
              </p>
            </section>

            <section id="choices" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">10. Your choices and requests</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                You can update certain profile details from your account. Depending on applicable law, you may also
                request access to, correction of, or deletion of personal information, or raise a concern about its
                use. Contact EaseHub Support to make a request. We may need to verify your identity and may retain
                information that we are legally required or otherwise permitted to keep, such as records needed to
                resolve an active payment or dispute. You can also manage Google access from your Google Account.
              </p>
            </section>

            <section id="children" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">11. Children and young users</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                EaseHub is designed for student residents and service users, not for children to use independently.
                If you are under the age at which you can consent to data processing under the laws that apply to
                you, use the platform only with the involvement and consent of a parent or guardian where required.
                If you believe a child has provided personal information without required consent, contact support.
              </p>
            </section>

            <section id="changes" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">12. Changes to this policy</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                We may update this policy as EaseHub or applicable requirements change. The latest version will be
                posted on this page with its updated date. If a change materially affects how information is used,
                we will provide notice through the platform or another appropriate channel where required.
              </p>
            </section>

            <section id="contact" className="scroll-mt-8 pt-7">
              <h2 className="text-xl font-extrabold text-[#225944]">13. Contact EaseHub</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                For privacy questions, data requests or concerns, contact EaseHub Support. Please do not include
                passwords, UPI PINs or one-time codes in your message.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/support"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#225944] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#184232]"
                >
                  Contact support <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                <a
                  href="https://wa.me/916201614778?text=Hello%20EaseHub%20Support%2C%20I%20have%20a%20privacy%20request."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#D8D8CE] bg-white px-4 py-3 text-sm font-bold text-[#225944] transition hover:bg-[#F3F4F0]"
                >
                  WhatsApp: +91 6201614778 <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
            </section>
          </article>
        </div>

        <p className="mx-auto mt-8 max-w-4xl text-center text-xs leading-6 text-[#77776E]">
          EaseHub’s use of personal information is subject to applicable law. This policy describes the platform’s
          current features and may be updated as those features change.
        </p>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
