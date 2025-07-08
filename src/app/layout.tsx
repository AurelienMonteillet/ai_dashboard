import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'

/**
 * Metadata configuration for the application
 * Defines title and description for SEO purposes
 */
export const metadata: Metadata = {
  title: 'TezMoon',
  description: 'TezMoon Dashboard',
}

/**
 * Root Layout Component
 * Provides the base structure for all pages including:
 * - Bootstrap CSS for styling
 * - Highcharts and its extensions for interactive charts
 * - Custom main.js for chart configurations
 * - Responsive header with Tezos branding
 * - Container for main content
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Bootstrap CSS from CDN */}
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        
        {/* Highcharts core must load before other scripts */}
        <Script src="/js/highcharts.js" strategy="beforeInteractive" />
        
        {/* Additional Highcharts modules and custom code */}
        <Script src="/js/highcharts-more.js" strategy="afterInteractive" />
        <Script src="/js/draggable-points.js" strategy="afterInteractive" />
        <Script src="/js/main.js" strategy="afterInteractive" />
      </head>
      <body>
        {/* Header with Tezos branding */}
        <header className="sticky top-0 z-20 w-full bg-gradient-to-r from-tezos-blue to-tezos-purple px-6 py-3 flex items-center shadow-md">
          <div className="flex items-center gap-2">
            <img src="/tezos-logo-white.svg" alt="Tezos Logo" style={{ height: '40px', marginRight: '1rem' }} />
            <span style={{ fontWeight: 'normal', fontSize: '2rem', letterSpacing: '0.05em', fontFamily: 'inherit' }}>Tezos</span>
          </div>
        </header>

        {/* Main content container */}
        <div className="min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <header className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Adaptive Issuance Dashboard
              </h1>
            </header>
            <main>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
