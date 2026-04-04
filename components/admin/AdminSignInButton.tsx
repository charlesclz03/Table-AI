'use client'

import { signIn } from 'next-auth/react'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/atoms/Button'

export function AdminSignInButton() {
  return (
    <Button
      variant="brand"
      size="lg"
      onClick={() => void signIn('google', { callbackUrl: '/admin' })}
      className="w-full"
    >
      <LogIn className="mr-2 h-4 w-4" />
      Continue with Google
    </Button>
  )
}
