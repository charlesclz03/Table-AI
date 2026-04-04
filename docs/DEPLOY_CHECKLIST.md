# Vercel Deploy Checklist

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial TableIA deploy"
git push
```

## Connect to Vercel

1. Go to `vercel.com`
2. Import the TableIA repository
3. Add the environment variables below

## Environment Variables

```env
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXTAUTH_SECRET=generate_with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000/
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co/
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Deploy

1. Click `Deploy`
2. Wait for a green build

## Stripe Webhook

In Stripe Dashboard -> Webhooks:

- URL: `https://your-domain.com/api/stripe/webhook`
- Events:
  - `checkout.session.completed`
  - `customer.subscription.updated`
