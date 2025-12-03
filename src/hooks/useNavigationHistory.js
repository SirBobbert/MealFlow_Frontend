import { useCallback } from 'react'

// Hook to provide a "go back" function using browser history
export function useNavigationHistory() {
  const goBack = useCallback(() => {
    window.history.back()
  }, [])

  return { goBack }
}
