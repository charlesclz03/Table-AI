import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getInviteByCode, claimInviteByCode } from '@/lib/admin/invites'
import { getAdminUserName } from '@/lib/admin/user'
import { getSupabaseServerComponentClient } from '@/lib/supabase/server'

interface InviteClaimPageProps {
  params: Promise<{
    code: string
  }>
  searchParams?: Promise<{
    error?: string
    claimed?: string
  }>
}

export default async function InviteClaimPage({
  params,
  searchParams,
}: InviteClaimPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const code = resolvedParams.code
  const { invite, restaurant } = await getInviteByCode(code)
  const client = await getSupabaseServerComponentClient()
  const {
    data: { user },
  } = client ? await client.auth.getUser() : { data: { user: null } }
  const currentEmail = user?.email?.trim().toLowerCase() || null
  const nextPath = `/invite/${encodeURIComponent(code)}`

  async function claimInviteAction() {
    'use server'

    const authClient = await getSupabaseServerComponentClient()
    const actionUserResult = authClient
      ? await authClient.auth.getUser()
      : { data: { user: null } }
    const {
      data: { user: actionUser },
    } = actionUserResult

    if (!actionUser?.email) {
      redirect(
        `/admin/login?mode=login&next=${encodeURIComponent(nextPath)}&error=${encodeURIComponent(
          'Please sign in before claiming this restaurant.'
        )}`
      )
    }

    try {
      await claimInviteByCode({
        code,
        ownerName: getAdminUserName(actionUser),
        userEmail: actionUser.email,
        userId: actionUser.id,
      })
      redirect(`/invite/${encodeURIComponent(code)}?claimed=true`)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to claim this restaurant right now.'
      redirect(
        `/invite/${encodeURIComponent(code)}?error=${encodeURIComponent(message)}`
      )
    }
  }

  if (!invite || !restaurant) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12">
        <div className="glass-panel w-full rounded-[36px] p-8 text-white">
          <p className="text-[11px] uppercase tracking-[0.34em] text-amber-200/70">
            Invite not found
          </p>
          <h1 className="mt-4 text-4xl font-semibold">
            This claim link is no longer available.
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/72">
            Ask the restaurant owner for a fresh invite link and try again.
          </p>
        </div>
      </div>
    )
  }

  const inviteEmail = invite.invitee_email.trim().toLowerCase()
  const isAcceptedByCurrentUser =
    Boolean(user?.id) && invite.accepted_by_owner_id === user?.id
  const isAlreadyClaimed = Boolean(invite.accepted_at)
  const isSignedInWithExpectedEmail = currentEmail === inviteEmail

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="glass-panel rounded-[36px] p-8 text-white">
          <p className="text-[11px] uppercase tracking-[0.34em] text-amber-200/70">
            Ownership invite
          </p>
          <h1 className="mt-4 text-4xl font-semibold">
            Claim {restaurant.name} in Gustia
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/72">
            This invite is reserved for{' '}
            <span className="font-medium text-white">
              {invite.invitee_email}
            </span>{' '}
            and will only work when you sign in with that exact email address.
          </p>

          <div className="glass-panel-soft mt-8 rounded-[28px] p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">
              What happens next
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-white/72">
              <p>1. Sign in or create your owner account.</p>
              <p>2. Confirm the invite email matches your account.</p>
              <p>
                3. Claim the restaurant and continue into the admin dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[36px] p-8 text-white">
          {resolvedSearchParams?.error ? (
            <div className="rounded-[24px] border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-50">
              {resolvedSearchParams.error}
            </div>
          ) : null}

          {isAcceptedByCurrentUser ||
          resolvedSearchParams?.claimed === 'true' ? (
            <div className="space-y-5">
              <div className="rounded-[24px] border border-emerald-300/20 bg-emerald-400/10 px-5 py-4 text-emerald-50">
                <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-200/70">
                  Claimed
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {restaurant.name} is now linked to your owner account.
                </h2>
              </div>

              <Link
                href="/admin"
                className="glass-button-amber inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-300/24"
              >
                Open admin dashboard
              </Link>
            </div>
          ) : isAlreadyClaimed ? (
            <div className="rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-sm leading-7 text-white/72">
              This invite has already been claimed. If you expected access,
              contact the restaurant owner for a fresh link.
            </div>
          ) : !user?.email ? (
            <div className="space-y-4">
              <p className="text-sm leading-7 text-white/72">
                Sign in first, then return to this screen and claim the
                restaurant.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/admin/login?mode=signup&next=${encodeURIComponent(nextPath)}`}
                  className="glass-button-amber inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-300/24"
                >
                  Create owner account
                </Link>
                <Link
                  href={`/admin/login?mode=login&next=${encodeURIComponent(nextPath)}`}
                  className="glass-button inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
                >
                  Log in
                </Link>
              </div>
            </div>
          ) : !isSignedInWithExpectedEmail ? (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-amber-300/20 bg-amber-300/10 px-5 py-4 text-sm leading-7 text-amber-50">
                You are signed in as{' '}
                <span className="font-medium text-white">{currentEmail}</span>,
                but this invite was issued to{' '}
                <span className="font-medium text-white">
                  {invite.invitee_email}
                </span>
                .
              </div>
              <Link
                href="/admin"
                className="glass-button inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                Go to admin instead
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-sm leading-7 text-white/72">
                Signed in as{' '}
                <span className="font-medium text-white">{currentEmail}</span>.
                You are ready to claim this restaurant.
              </div>

              <form action={claimInviteAction}>
                <button
                  type="submit"
                  className="glass-button-amber inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-300/24"
                >
                  Claim this restaurant
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
