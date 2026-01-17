'use client'

import { useRouter } from 'next/navigation'
import { Header, Stepper } from '@/components/layout'

export default function UnpackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showBackButton
        onBack={() => router.push('/')}
      />
      <div className="bg-white border-b border-gray-200">
        <Stepper />
      </div>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
