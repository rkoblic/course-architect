'use client'

import { useRouter } from 'next/navigation'
import { resetAllStores } from '@/lib/reset-stores'

export default function HomePage() {
  const router = useRouter()

  const handleUnpackClick = () => {
    resetAllStores()
    router.push('/unpack')
  }
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Course Architect</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-3xl w-full">
          {/* Tagline */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Design curriculum for the age of AI
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transform your syllabus into AI-ready structures, then audit and redesign assessments for authenticity.
            </p>
          </div>

          {/* Mode Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Unpack Mode */}
            <button onClick={handleUnpackClick} className="group text-left">
              <div className="h-full border border-gray-200 rounded-xl p-6 bg-white hover:border-primary-500 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  Unpack
                </h3>
                <p className="text-gray-600 mb-4">
                  Transform your syllabus into a structured, machine-readable format that preserves your pedagogical intent.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>Extract learning modules and outcomes</li>
                  <li>Build a knowledge graph of concepts</li>
                  <li>Define AI collaboration modes</li>
                </ul>
              </div>
            </button>

            {/* Assess Mode */}
            <div className="group cursor-not-allowed">
              <div className="h-full border border-gray-200 rounded-xl p-6 bg-white opacity-60">
                <div className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Assess
                  </h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    Coming Soon
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  Audit your assessments for AI vulnerability and generate authentic alternatives.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>Analyze AI completion risk</li>
                  <li>Design AI-resistant assessments</li>
                  <li>Create rubrics for authentic work</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Philosophy note */}
          <p className="text-center text-sm text-gray-500 mt-10">
            Faculty are the architects. AI is the tool.
          </p>
        </div>
      </main>
    </div>
  )
}
