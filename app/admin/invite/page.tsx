import Link from 'next/link'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { EmptyRestaurantState } from '@/components/admin/EmptyRestaurantState'
import {
  createRestaurantInvite,
  listRestaurantInvites,
} from '@/lib/admin/invites'
import { requireAdminContext } from '@/lib/admin/server'
import { getPublicEnv } from '@/lib/env'

const inviteEmailSchema = z.string().trim().email()

interface AdminInvitePageProps {
  searchParams?: Promise<{
    created?: string
    error?: string
  }>
}

function formatInviteDate(value?: string | null) {
  if (!value) {
    return 'Just now'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date'
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export default async function AdminInvitePage({
  searchParams,
}: AdminInvitePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const { owner, restaurant, userEmail } = await requireAdminContext()

  if (!restaurant) {
    return <EmptyRestaurantState email={userEmail} />
  }

  const ownerId = owner?.id || null
  const restaurantId = restaurant.id

  async function createInviteAction(formData: FormData) {
    'use server'

    try {
      const inviteeEmail = inviteEmailSchema.parse(formData.get('inviteeEmail'))
      const invite = await createRestaurantInvite({
        invitedByOwnerId: ownerId,
        inviteeEmail,
        restaurantId,
      })

      redirect(
        `/admin/invite?created=${encodeURIComponent(invite.invite_token || '')}`
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to create the invite.'
      redirect(`/admin/invite?error=${encodeURIComponent(message)}`)
    }
  }

  const invites = await listRestaurantInvites(restaurantId)
  const publicEnv = getPublicEnv()
  const latestCreatedInvite =
    invites.find(
      (invite) => invite.invite_token === resolvedSearchParams?.created
    ) || null

  return (
    <AdminPageShell
      eyebrow="Owner Invites"
      title={`Invite a co-owner to ${restaurant.name}`}
      description="Generate a secure claim link for a specific owner email. When the invitee signs in with that email, they can claim this restaurant and enter the admin workspace."
    >
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[28px] border border-white/10 bg-white/6 p-6 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Create invite
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">
            Send an ownership claim link
          </h3>
          <p className="mt-3 text-sm leading-7 text-white/70">
            The invite only works for the exact email you enter. If a pending
            invite already exists for that address, Gustia refreshes the link so
            you always share the latest claim URL.
          </p>

          {resolvedSearchParams?.error ? (
            <div className="mt-5 rounded-[24px] border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-50">
              {resolvedSearchParams.error}
            </div>
          ) : null}

          <form action={createInviteAction} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-white/72">
                Owner email
              </span>
              <input
                type="email"
                name="inviteeEmail"
                required
                placeholder="owner@restaurant.com"
                className="glass-input h-12 w-full rounded-[18px] px-4 text-white outline-none placeholder:text-white/35 focus:border-amber-300/40"
              />
            </label>

            <button
              type="submit"
              className="glass-button-amber inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-300/24"
            >
              Generate invite link
            </button>
          </form>

          {latestCreatedInvite?.invite_token ? (
            <div className="glass-panel-soft mt-6 rounded-[24px] p-5">
              <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-200/70">
                Ready to share
              </p>
              <p className="mt-3 text-sm text-white/72">
                Send this link to{' '}
                <span className="font-medium text-white">
                  {latestCreatedInvite.invitee_email}
                </span>
                .
              </p>
              <div className="mt-4 overflow-x-auto rounded-[20px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/85">
                {`${publicEnv.siteUrl.replace(/\/$/, '')}/invite/${latestCreatedInvite.invite_token}`}
              </div>
            </div>
          ) : null}
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/6 p-6 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
                Invite history
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">
                Pending and claimed links
              </h3>
            </div>
            <p className="text-sm text-white/50">Signed in as {userEmail}</p>
          </div>

          <div className="mt-6 space-y-4">
            {invites.length > 0 ? (
              invites.map((invite) => {
                const inviteLink = invite.invite_token
                  ? `${publicEnv.siteUrl.replace(/\/$/, '')}/invite/${invite.invite_token}`
                  : null

                return (
                  <article
                    key={invite.id}
                    className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {invite.invitee_email}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/45">
                          Created {formatInviteDate(invite.created_at)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                          invite.accepted_at
                            ? 'border border-emerald-300/20 bg-emerald-400/10 text-emerald-100'
                            : 'border border-amber-300/20 bg-amber-300/10 text-amber-100'
                        }`}
                      >
                        {invite.accepted_at ? 'Claimed' : 'Pending'}
                      </span>
                    </div>

                    {inviteLink ? (
                      <div className="mt-4 overflow-x-auto rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
                        {inviteLink}
                      </div>
                    ) : null}

                    {invite.invite_token ? (
                      <div className="mt-4">
                        <Link
                          href={`/invite/${invite.invite_token}`}
                          className="text-sm text-amber-100 transition hover:text-white"
                        >
                          Open invite preview
                        </Link>
                      </div>
                    ) : null}
                  </article>
                )
              })
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/65">
                No invites have been created yet. Generate the first claim link
                on the left and it will appear here.
              </div>
            )}
          </div>
        </article>
      </section>
    </AdminPageShell>
  )
}
