import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminSignInButton } from '@/components/admin/AdminSignInButton'

export default async function AdminLoginPage() {
  const session = await auth()

  if (session?.user?.email) {
    redirect('/admin')
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-4 py-12">
      <div className="w-full rounded-[36px] border border-white/10 bg-white/6 p-8 text-white shadow-2xl backdrop-blur">
        <p className="text-[11px] uppercase tracking-[0.34em] text-amber-200/70">
          TableIA Admin
        </p>
        <h1 className="mt-4 text-4xl font-semibold">
          Welcome back to your dining room dashboard
        </h1>
        <p className="mt-4 text-sm leading-7 text-white/70">
          Sign in with Google and we&apos;ll open your owner dashboard right
          away. If this is your first visit, we&apos;ll create your restaurant
          space automatically so you can start setting up the experience.
        </p>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-black/20 p-5">
          <p className="text-sm leading-7 text-white/75">
            This admin space lets you edit the menu, retake the onboarding quiz,
            generate QR posters, and manage billing without leaving the owner
            view.
          </p>
        </div>

        <div className="mt-8">
          <AdminSignInButton />
        </div>
      </div>
    </div>
  )
}
