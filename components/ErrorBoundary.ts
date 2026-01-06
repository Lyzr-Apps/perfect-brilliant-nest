/**
 * Error Boundary Utilities
 * Handles iframe communication for error reporting
 */

interface ErrorDetails {
  type: 'react_error' | 'api_error' | 'parse_error' | 'network_error' | 'unknown'
  message: string
  stack?: string
  componentStack?: string
  raw_response?: string
  endpoint?: string
  timestamp: string
  userAgent: string
  url: string
}

/**
 * Check if running inside an iframe
 */
export function isInIframe(): boolean {
  try {
    return typeof window !== 'undefined' && window.self !== window.top
  } catch (e) {
    return false
  }
}

/**
 * Send error to parent iframe
 */
export function sendErrorToParent(error: ErrorDetails): void {
  if (typeof window === 'undefined') return

  try {
    window.parent.postMessage(
      {
        type: 'ERROR',
        payload: error,
      },
      '*'
    )
  } catch (e) {
    console.error('Failed to send error to parent:', e)
  }
}

/**
 * Request fix from parent iframe
 */
export function requestFixFromParent(error: ErrorDetails): void {
  if (typeof window === 'undefined') return

  try {
    window.parent.postMessage(
      {
        type: 'FIX_REQUEST',
        payload: error,
      },
      '*'
    )
  } catch (e) {
    console.error('Failed to send fix request to parent:', e)
  }
}
