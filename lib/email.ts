import { getServerEnv } from '@/lib/server-env'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/email')

export type NotificationEventType =
  | 'owner_signup'
  | 'subscription_activated'
  | 'subscription_updated'
  | 'subscription_canceled'
  | 'invoice_paid'
  | 'invoice_failed'

export interface NotificationEvent {
  eventType: NotificationEventType
  ownerEmail?: string | null
  ownerName?: string | null
  restaurantId?: string | null
  restaurantName?: string | null
  planName?: string | null
  subscriptionStatus?: string | null
  amountMinor?: number | null
  currency?: string | null
  invoiceUrl?: string | null
  occurredAt?: string | null
  metadata?: Record<string, unknown>
}

interface EmailMessage {
  html: string
  subject: string
  text: string
  to: string[]
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function formatMoney(amountMinor?: number | null, currency?: string | null) {
  if (typeof amountMinor !== 'number' || !Number.isFinite(amountMinor)) {
    return null
  }

  const normalizedCurrency = (currency || 'EUR').toUpperCase()

  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: normalizedCurrency,
    }).format(amountMinor / 100)
  } catch {
    return `${(amountMinor / 100).toFixed(2)} ${normalizedCurrency}`
  }
}

function formatEventTimestamp(value?: string | null) {
  if (!value) {
    return new Date().toISOString()
  }

  return value
}

function getNotificationTargets(options: {
  includeOwner?: boolean
  ownerEmail?: string | null
}) {
  const env = getServerEnv()
  const targets = new Set<string>()

  if (env.notifyToEmail) {
    targets.add(env.notifyToEmail)
  }

  if (options.includeOwner && options.ownerEmail) {
    targets.add(options.ownerEmail)
  }

  return [...targets]
}

function buildOwnerSignupEmail(event: NotificationEvent): EmailMessage {
  const restaurantName = event.restaurantName?.trim() || 'New restaurant'
  const ownerEmail = event.ownerEmail?.trim() || 'unknown'
  const ownerName = event.ownerName?.trim() || 'New owner'
  const subject = `New Gustia signup: ${restaurantName}`

  return {
    to: getNotificationTargets({ ownerEmail: event.ownerEmail }),
    subject,
    text: [
      'A new owner signup reached the app.',
      `Owner: ${ownerName}`,
      `Email: ${ownerEmail}`,
      `Restaurant: ${restaurantName}`,
      event.restaurantId ? `Restaurant ID: ${event.restaurantId}` : null,
      `Occurred at: ${formatEventTimestamp(event.occurredAt)}`,
    ]
      .filter(Boolean)
      .join('\n'),
    html: [
      '<h1>New owner signup</h1>',
      `<p><strong>Owner:</strong> ${escapeHtml(ownerName)}</p>`,
      `<p><strong>Email:</strong> ${escapeHtml(ownerEmail)}</p>`,
      `<p><strong>Restaurant:</strong> ${escapeHtml(restaurantName)}</p>`,
      event.restaurantId
        ? `<p><strong>Restaurant ID:</strong> ${escapeHtml(event.restaurantId)}</p>`
        : '',
      `<p><strong>Occurred at:</strong> ${escapeHtml(
        formatEventTimestamp(event.occurredAt)
      )}</p>`,
    ].join(''),
  }
}

function buildBillingEmail(
  event: NotificationEvent,
  options: {
    includeOwner: boolean
    intro: string
    subjectPrefix: string
  }
): EmailMessage {
  const restaurantName = event.restaurantName?.trim() || 'Your restaurant'
  const planName = event.planName?.trim() || 'Founding Restaurant'
  const amount = formatMoney(event.amountMinor, event.currency)
  const status = event.subscriptionStatus?.trim() || 'unknown'
  const subject = `${options.subjectPrefix}: ${restaurantName}`

  return {
    to: getNotificationTargets({
      includeOwner: options.includeOwner,
      ownerEmail: event.ownerEmail,
    }),
    subject,
    text: [
      options.intro,
      `Restaurant: ${restaurantName}`,
      `Plan: ${planName}`,
      `Status: ${status}`,
      amount ? `Amount: ${amount}` : null,
      event.invoiceUrl ? `Invoice: ${event.invoiceUrl}` : null,
      `Occurred at: ${formatEventTimestamp(event.occurredAt)}`,
    ]
      .filter(Boolean)
      .join('\n'),
    html: [
      `<h1>${escapeHtml(subject)}</h1>`,
      `<p>${escapeHtml(options.intro)}</p>`,
      `<p><strong>Restaurant:</strong> ${escapeHtml(restaurantName)}</p>`,
      `<p><strong>Plan:</strong> ${escapeHtml(planName)}</p>`,
      `<p><strong>Status:</strong> ${escapeHtml(status)}</p>`,
      amount ? `<p><strong>Amount:</strong> ${escapeHtml(amount)}</p>` : '',
      event.invoiceUrl
        ? `<p><a href="${escapeHtml(event.invoiceUrl)}">Open invoice</a></p>`
        : '',
      `<p><strong>Occurred at:</strong> ${escapeHtml(
        formatEventTimestamp(event.occurredAt)
      )}</p>`,
    ].join(''),
  }
}

function buildNotificationEmail(event: NotificationEvent) {
  switch (event.eventType) {
    case 'owner_signup':
      return buildOwnerSignupEmail(event)
    case 'subscription_activated':
      return buildBillingEmail(event, {
        includeOwner: true,
        intro: 'A new subscription has been activated.',
        subjectPrefix: 'Subscription activated',
      })
    case 'subscription_updated':
      return buildBillingEmail(event, {
        includeOwner: true,
        intro: 'The subscription status changed.',
        subjectPrefix: 'Subscription updated',
      })
    case 'subscription_canceled':
      return buildBillingEmail(event, {
        includeOwner: true,
        intro: 'The subscription was canceled or ended.',
        subjectPrefix: 'Subscription canceled',
      })
    case 'invoice_paid':
      return buildBillingEmail(event, {
        includeOwner: true,
        intro: 'A subscription invoice was paid successfully.',
        subjectPrefix: 'Invoice paid',
      })
    case 'invoice_failed':
      return buildBillingEmail(event, {
        includeOwner: true,
        intro: 'A subscription invoice failed. Follow up may be needed.',
        subjectPrefix: 'Invoice failed',
      })
    default:
      return null
  }
}

async function sendWithResend(message: EmailMessage) {
  const env = getServerEnv()

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.emailFrom,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  })

  if (!response.ok) {
    throw new Error(`Resend email failed with ${response.status}.`)
  }
}

async function sendWithSendGrid(message: EmailMessage) {
  const env = getServerEnv()

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.sendGridApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: {
        email: env.emailFrom,
      },
      personalizations: [
        {
          to: message.to.map((email) => ({
            email,
          })),
          subject: message.subject,
        },
      ],
      content: [
        {
          type: 'text/plain',
          value: message.text,
        },
        {
          type: 'text/html',
          value: message.html,
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`SendGrid email failed with ${response.status}.`)
  }
}

export async function sendNotificationEvent(event: NotificationEvent) {
  const message = buildNotificationEmail(event)

  if (!message || message.to.length === 0) {
    return {
      delivered: false,
      provider: 'none',
    } as const
  }

  const env = getServerEnv()

  if (env.resendApiKey) {
    await sendWithResend(message)

    return {
      delivered: true,
      provider: 'resend',
    } as const
  }

  if (env.sendGridApiKey) {
    await sendWithSendGrid(message)

    return {
      delivered: true,
      provider: 'sendgrid',
    } as const
  }

  console.info('Notification skipped because no email provider is configured.', {
    eventType: event.eventType,
    to: message.to,
  })

  return {
    delivered: false,
    provider: 'none',
  } as const
}
