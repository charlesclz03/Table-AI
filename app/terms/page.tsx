import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPageShell, LegalSection } from '@/app/legal/legal-shell'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that apply to restaurant use of Gustia.',
}

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Terms"
      title="Terms of Service"
      summary="These terms govern restaurant access to Gustia, including service scope, pricing, billing, cancellation, customer responsibilities, and liability limits."
      updatedOn="April 4, 2026"
    >
      <LegalSection title="1. Service description">
        <p>
          Gustia provides an AI concierge service for restaurants. The service
          is designed to help guests discover menu items, ask questions about
          dishes and drinks, and receive restaurant-specific guidance through a
          chat interface.
        </p>
        <p>
          Gustia is a software service. It supports restaurant operations but
          does not replace the restaurant&apos;s own responsibility for menu
          accuracy, hospitality, food safety, or regulatory compliance.
        </p>
      </LegalSection>

      <LegalSection title="2. Pricing and payment terms">
        <p>
          Unless otherwise agreed in writing, Gustia pricing is a one-time setup
          fee of 99 EUR plus a recurring subscription of 49 EUR per month or 470
          EUR per year.
        </p>
        <p>
          Subscription billing may be offered on a monthly or annual basis and
          is charged in advance for the selected billing cycle after the
          activation period. The setup fee is billed separately when the service
          is activated.
        </p>
        <p>
          Restaurants are responsible for keeping payment details valid and up
          to date. Unpaid or failed charges may result in suspension of access
          until the account is brought current.
        </p>
      </LegalSection>

      <LegalSection title="3. Cancellation">
        <p>
          Restaurants may cancel the subscription at any time. Cancellation
          stops future renewals, and access generally remains available until
          the end of the current paid billing period unless otherwise stated in
          a written agreement.
        </p>
        <p>
          Setup fees are non-refundable once implementation work has started,
          except where required by law.
        </p>
      </LegalSection>

      <LegalSection title="4. Restaurant responsibilities">
        <p>
          Each restaurant is responsible for providing accurate and current menu
          details, pricing, allergens, availability, and business information.
          Gustia relies on restaurant-provided information to generate helpful
          responses.
        </p>
        <p>
          The restaurant remains responsible for reviewing its content and for
          making sure the service is used in a way that fits its operations,
          brand standards, and legal obligations.
        </p>
      </LegalSection>

      <LegalSection title="5. Limitation of liability">
        <p>
          Gustia is provided on an as-available basis. While we aim for a
          reliable service, we do not guarantee uninterrupted operation, perfect
          accuracy, or error-free outputs in every case.
        </p>
        <p>
          To the maximum extent allowed by law, Gustia will not be liable for
          indirect, incidental, special, or consequential damages, or for loss
          of revenue, profits, data, or business opportunity arising from use of
          the service.
        </p>
      </LegalSection>

      <LegalSection title="6. Contact">
        <p>
          Questions about these terms can be sent to{' '}
          <Link
            href="mailto:contact@gustia.wine"
            className="font-medium text-amber-100 transition hover:text-white"
          >
            contact@gustia.wine
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  )
}
