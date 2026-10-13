import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, CalendarDays, FileText } from 'lucide-react';

const termsSections = [
  { id: 'agreement', title: '1. Agreement to these Terms' },
  { id: 'eligibility', title: '2. Eligibility and accounts' },
  { id: 'platform', title: '3. The EaseHub platform' },
  { id: 'bookings', title: '4. Bookings and service requests' },
  { id: 'payments', title: '5. Payments and verification' },
  { id: 'conduct', title: '6. Your responsibilities' },
  { id: 'content', title: '7. Reviews and community content' },
  { id: 'third-parties', title: '8. Third-party services' },
  { id: 'ownership', title: '9. EaseHub content and intellectual property' },
  { id: 'availability', title: '10. Availability and liability' },
  { id: 'suspension', title: '11. Account restrictions' },
  { id: 'privacy', title: '12. Privacy' },
  { id: 'changes', title: '13. Changes to these Terms' },
  { id: 'law', title: '14. Applicable law' },
  { id: 'contact', title: '15. Contact EaseHub' },
];

const TermsAndConditionsPage: React.FC = () => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Terms & Conditions | EaseHub';
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
              <FileText size={15} aria-hidden="true" />
              Using EaseHub
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[#225944] sm:text-5xl">Terms &amp; Conditions</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#55554E] sm:text-base">
              These Terms explain the basic rules for using EaseHub to explore student accommodation, meals,
              laundry and other local services, and to use our account, booking, payment and community features.
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
            <nav aria-label="Terms and conditions sections" className="max-h-[60vh] space-y-1 overflow-y-auto pr-1">
              {termsSections.map((section) => (
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
            <section id="agreement" className="scroll-mt-8 border-b border-[#EDEEEB] pb-7">
              <h2 className="text-xl font-extrabold text-[#225944]">1. Agreement to these Terms</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                These Terms &amp; Conditions (“Terms”) apply when you access or use the EaseHub website and its
                related features. By using the platform, creating an account or submitting a booking or service
                request, you agree to these Terms and the <Link to="/privacy-policy" className="font-bold text-[#225944] underline">Privacy Policy</Link>.
                If you do not agree, do not use the features covered by these Terms. A service or listing may also
                have additional terms shown to you before you make a request or payment; those terms apply to that
                specific service as well.
              </p>
            </section>

            <section id="eligibility" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">2. Eligibility and accounts</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-[#55554E] marker:text-[#225944]">
                <li>Provide accurate, current information when registering or requesting a service, and update it when it changes.</li>
                <li>Keep your sign-in details and devices secure. You are responsible for activity carried out through your account; notify EaseHub promptly if you suspect unauthorized access.</li>
                <li>Use only an account you are authorized to access. Do not impersonate another person or create an account with misleading information.</li>
                <li>EaseHub is intended for student residents and people seeking local services. If you are below the age at which you may consent under applicable law, use the platform only with parent or guardian involvement where required.</li>
              </ul>
            </section>

            <section id="platform" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">3. The EaseHub platform</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                EaseHub provides a way to discover accommodation, meals, laundry and other local services and to
                send related requests. Listings, availability, prices, amenities, photos and service details may be
                supplied or updated by property owners or service providers. Check the current details and ask any
                questions important to you before you commit. A listing or request shown on the platform is not, by
                itself, a guarantee that a booking is confirmed or a service is available.
              </p>
            </section>

            <section id="bookings" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">4. Bookings and service requests</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-[#55554E] marker:text-[#225944]">
                <li>Submitting a request does not confirm it. Wait for the confirmation or instructions shown by EaseHub or the relevant provider.</li>
                <li>Review the service, address, dates, price and any provider-specific conditions before completing a request or payment.</li>
                <li>Cancellation, rescheduling, deposits, refunds, delivery and fulfillment depend on the terms shown for the relevant listing or communicated by the provider and EaseHub.</li>
                <li>Contact EaseHub support promptly if a booking detail is incorrect, a service is not delivered as expected, or you need help with a cancellation or dispute.</li>
              </ul>
            </section>

            <section id="payments" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">5. Payments and verification</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                Follow the payment instructions shown for your booking. For UPI payments, make sure the recipient
                and amount are correct in your UPI app. EaseHub may ask for a UTR or transaction reference and a
                receipt screenshot to verify a payment manually. A submitted receipt is not confirmation that a
                payment has been verified; check the status shown in your account or contact support. Never share
                your UPI PIN, password or one-time passcode with EaseHub, a provider or another user.
              </p>
            </section>

            <section id="conduct" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">6. Your responsibilities</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">When using EaseHub, you agree not to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-[#55554E] marker:text-[#225944]">
                <li>break the law, violate another person’s rights, or use the platform to harass, threaten, defraud or harm anyone;</li>
                <li>submit false, deceptive, infringing, abusive or unlawful information or content;</li>
                <li>probe, disrupt, overload, reverse engineer or attempt unauthorized access to the platform, its accounts or systems;</li>
                <li>misuse another person’s personal, payment or account information; or</li>
                <li>circumvent access controls or use the platform for unsolicited promotions, spam or activities unrelated to its services.</li>
              </ul>
            </section>

            <section id="content" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">7. Reviews and community content</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                You are responsible for content you submit, including reviews, ratings, messages and profile images.
                Share only content you have the right to use, keep reviews relevant and honest, and do not publish
                sensitive personal or payment information. By submitting content, you allow EaseHub to host, display
                and use it as needed to operate and provide the feature you submitted it to. We may remove content
                or restrict access where reasonably necessary to enforce these Terms, protect users or comply with law.
              </p>
            </section>

            <section id="third-parties" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">8. Third-party services</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                Some features rely on or link to services operated by others, including Google sign-in, map and
                geocoding services, hosting, storage and UPI apps. Those services are governed by their own terms
                and privacy policies. EaseHub does not control third-party services and is not responsible for
                changes to their availability or policies. Your dealings with a property owner, service provider,
                bank or payment app may also be subject to separate terms.
              </p>
            </section>

            <section id="ownership" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">9. EaseHub content and intellectual property</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                EaseHub and its licensors retain rights in the platform, branding, design, software and content they
                provide, except for content owned by others. You may use the platform for its intended personal or
                service-related purposes. Do not copy, modify, redistribute or commercially exploit EaseHub content
                or branding without prior permission, except where applicable law allows it.
              </p>
            </section>

            <section id="availability" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">10. Availability and liability</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                We work to keep EaseHub useful and available, but access may be interrupted for maintenance,
                updates, network issues or events outside our reasonable control. To the extent permitted by
                applicable law, the platform is provided as available, and EaseHub is not responsible for indirect
                or consequential losses arising from use of the platform. Nothing in these Terms excludes a
                responsibility or right that cannot legally be excluded. These Terms do not replace any rights you
                have under applicable consumer-protection law.
              </p>
            </section>

            <section id="suspension" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">11. Account restrictions</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                We may limit or suspend access to an account or feature where we reasonably believe these Terms
                have been violated, an account is compromised, a user or provider may be at risk, or action is
                required by law. Where appropriate, we will provide a reason and a way to contact support. You may
                stop using EaseHub at any time. Ending use does not cancel payment, booking or other obligations
                already incurred under applicable service terms.
              </p>
            </section>

            <section id="privacy" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">12. Privacy</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                Our <Link to="/privacy-policy" className="font-bold text-[#225944] underline">Privacy Policy</Link> explains what personal information
                EaseHub handles, why it is used and how to make a privacy request. By using the platform, you
                acknowledge that your information will be handled as described there and as permitted by applicable law.
              </p>
            </section>

            <section id="changes" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">13. Changes to these Terms</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                We may update these Terms as the platform or applicable requirements change. The current version
                will be posted on this page with an updated date. Continued use after updated Terms take effect
                means you accept them, to the extent permitted by applicable law. If you do not agree to an update,
                stop using the affected features.
              </p>
            </section>

            <section id="law" className="scroll-mt-8 border-b border-[#EDEEEB] py-7">
              <h2 className="text-xl font-extrabold text-[#225944]">14. Applicable law</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                These Terms are subject to the laws applicable in India. Disputes will be handled by the competent
                forums under applicable law. Nothing in this section limits rights or remedies that cannot be
                limited by law.
              </p>
            </section>

            <section id="contact" className="scroll-mt-8 pt-7">
              <h2 className="text-xl font-extrabold text-[#225944]">15. Contact EaseHub</h2>
              <p className="mt-3 text-sm leading-7 text-[#55554E]">
                For questions about these Terms, a listing, a booking or a service request, contact EaseHub Support.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/support"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#225944] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#184232]"
                >
                  Contact support <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                <a
                  href="https://wa.me/916201614778?text=Hello%20EaseHub%20Support%2C%20I%20have%20a%20question%20about%20the%20Terms."
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

        <div className="mx-auto mt-8 max-w-4xl text-center text-xs leading-6 text-[#77776E]">
          Please review any property- or provider-specific conditions shown with the service you request. These
          general Terms should be reviewed by qualified counsel before being treated as a final legal agreement.
        </div>
      </main>
    </div>
  );
};

export default TermsAndConditionsPage;
