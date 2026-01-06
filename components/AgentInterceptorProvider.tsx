'use client'

import React, { useEffect, ReactNode } from 'react'
import { sendErrorToParent } from './ErrorBoundary'

interface AgentInterceptorProviderProps {
  children: ReactNode
}

/**
 * AgentInterceptorProvider
 * Monitors API calls to /api/agent and detects JSON parsing failures
 * Sends error details to parent iframe for auto-fix capability
 */
export function AgentInterceptorProvider({
  children,
}: AgentInterceptorProviderProps) {
  useEffect(() => {
    // Store original fetch
    const originalFetch = window.fetch

    // Override fetch to intercept /api/agent calls
    window.fetch = function (...args) {
      const [resource] = args
      const url = typeof resource === 'string' ? resource : resource?.url

      // Only intercept /api/agent calls
      if (typeof url === 'string' && url.includes('/api/agent')) {
        return originalFetch.apply(this, args as any).then(async (response) => {
          // Clone response to read body without consuming it
          const clone = response.clone()

          // Check if response is OK
          if (!response.ok) {
            try {
              const errorData = await clone.json()
              sendErrorToParent({
                type: 'api_error',
                message: errorData.error || 'API call failed',
                endpoint: '/api/agent',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
              })
            } catch (e) {
              console.error('Failed to parse error response:', e)
            }
          }

          return response
        })
      }

      // Pass through other fetch calls
      return originalFetch.apply(this, args as any)
    } as any

    return () => {
      // Restore original fetch on cleanup
      window.fetch = originalFetch
    }
  }, [])

  return <>{children}</>
}
