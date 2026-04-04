import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPageShell, LegalSection } from '@/app/legal/legal-shell'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How TableIA collects, stores, and uses restaurant and chat data.',
}

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacy"
      title="Privacy Policy"
      summary="This policy explains what TableIA stores, why we store it, and how we protect restaurant and guest conversation data while operating our AI concierge service."
      updatedOn="April 4, 2026"
    >
      <LegalSection title="1. What we collect">
        <p>
          TableIA collects the minimum information needed to run the AI
          concierge service for restaurants. This includes restaurant profile
          details such as venue name, menu information, onboarding answers,
          operating preferences, and account contact details.
        </p>
        <p>
          We also store guest and restaurant chat logs created through the
          concierge experience. These logs may include questions about dishes,
          allergens, wine pairings, opening hours, and other restaurant-related
          requests submitted through the service.
        </p>
      </LegalSection>

      <LegalSection title="2. How we use data">
        <p>
          We use collected data only to deliver, maintain, and improve the
          TableIA AI concierge service. That includes answering guest questions,
          tailoring responses to a restaurant&apos;s menu and setup, supporting
          restaurant owners, and diagnosing service issues when needed.
        </p>
        <p>
          We do not use restaurant data or chat logs for unrelated advertising
          purposes, and we do not repurpose that data outside the operation of
          the TableIA service.
        </p>
      </LegalSection>

      <LegalSection title="3. Storage and security">
        <p>
          TableIA stores service data using Supabase-backed infrastructure. We
          use industry-standard safeguards, including encrypted connections in
          transit and infrastructure-level encryption at rest provided by our
          service providers.
        </p>
        <p>
          Access to stored data is limited to what is necessary to operate,
          support, and secure the service. No system can promise absolute
          security, but we work to keep reasonable technical and organizational
          protections in place.
        </p>
      </LegalSection>

      <LegalSection title="4. We do not sell your data">
        <p>
          TableIA does not sell restaurant data, guest conversation data, or
          account information to third parties. If we work with subprocessors to
          run the service, they are used only to support delivery of TableIA.
        </p>
      </LegalSection>

      <LegalSection title="5. Retention and contact">
        <p>
          We keep data for as long as reasonably necessary to provide the
          service, maintain account records, and resolve operational or legal
          matters. Restaurants may contact us to request account-related support
          or discuss data handling questions.
        </p>
        <p>
          For privacy questions, contact{' '}
          <Link
            href="mailto:support@tableia.com"
            className="font-medium text-amber-100 transition hover:text-white"
          >
            support@tableia.com
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  )
}
