import { redirect } from 'next/navigation'
import { AdminAuthForm } from '@/components/admin/AdminAuthForm'
import { normalizeNextPath } from '@/lib/admin/auth-session'
import { getSupabaseServerComponentClient } from '@/lib/supabase/server'

interface AdminLoginPageProps {
  searchParams?: Promise<{
    checkEmail?: string
    error?: string
    missing?: string
    mode?: 'login' | 'signup'
    next?: string
  }>
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const nextPath = normalizeNextPath(resolvedSearchParams?.next)
  const client = await getSupabaseServerComponentClient()
  const {
    data: { user },
  } = client ? await client.auth.getUser() : { data: { user: null } }

  if (user?.email) {
    redirect(nextPath)
  }

  const noticeMessage =
    resolvedSearchParams?.checkEmail === 'true'
      ? 'Check your inbox to confirm the owner account before signing in.'
      : null
  const errorMessage =
    typeof resolvedSearchParams?.error === 'string'
      ? resolvedSearchParams.error
      : resolvedSearchParams?.missing === 'restaurant'
        ? 'We could not resolve a restaurant for this owner session yet.'
        : null

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-4 py-12">
      <div className="glass-panel w-full rounded-[36px] p-8 text-white">
        <p className="text-[11px] uppercase tracking-[0.34em] text-amber-200/70">
          Gustia Admin
        </p>
        <h1 className="mt-4 text-4xl font-semibold">
          Welcome back to your dining room dashboard
        </h1>
        <p className="mt-4 text-sm leading-7 text-white/70">
          Log in with email and password or continue with Google. On the first
          owner sign-in, Gustia links your Supabase Auth account to your
          restaurant workspace so the admin stays isolated to your data.
        </p>

        <div className="glass-panel-soft mt-8 rounded-[28px] p-5">
          <p className="text-sm leading-7 text-white/75">
            This admin space lets you edit the menu, retake the onboarding quiz,
            generate QR posters, and manage billing without leaving the owner
            view.
          </p>
        </div>

        <div className="mt-8">
          <AdminAuthForm
            errorMessage={errorMessage}
            initialMode={
              resolvedSearchParams?.mode === 'signup' ? 'signup' : 'login'
            }
            nextPath={nextPath}
            noticeMessage={noticeMessage}
          />
        </div>
      </div>
    </div>
  )
}
