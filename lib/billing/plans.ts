export const ACTIVATION_FEE_AMOUNT = 9900
export const BILLING_DELAY_DAYS = 30

export type CheckoutPlanId = 'monthly' | 'annual'

export interface CheckoutPlanDefinition {
  id: CheckoutPlanId
  name: string
  billingLabel: string
  recurringAmount: number
  description: string
  savingsLabel?: string
  interval: 'month' | 'year'
}

const CHECKOUT_PLANS: Record<CheckoutPlanId, CheckoutPlanDefinition> = {
  monthly: {
    id: 'monthly',
    name: 'Monthly',
    billingLabel: 'EUR 49 per month',
    recurringAmount: 4900,
    description:
      'Flexible monthly billing for one venue after the activation period.',
    interval: 'month',
  },
  annual: {
    id: 'annual',
    name: 'Annual',
    billingLabel: 'EUR 470 per year',
    recurringAmount: 47000,
    description:
      'Annual billing with two months free after the activation period.',
    savingsLabel: 'Save EUR 118 per year',
    interval: 'year',
  },
}

export function getCheckoutPlan(
  plan: string | null | undefined
): CheckoutPlanDefinition | null {
  if (plan !== 'monthly' && plan !== 'annual') {
    return null
  }

  return CHECKOUT_PLANS[plan]
}

export function getCheckoutPlans() {
  return Object.values(CHECKOUT_PLANS)
}

export function formatEuroAmount(amount: number) {
  return new Intl.NumberFormat('en-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount / 100)
}
