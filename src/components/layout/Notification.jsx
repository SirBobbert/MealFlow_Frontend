// src/components/layout/Notification.jsx
import { useEffect } from 'react'

function Notification({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (message && onClose) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [message, onClose, duration])

  if (!message) return null

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <span className="notification-icon">
          {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
        </span>
        <span className="notification-message">{message}</span>
        <button 
          className="notification-close" 
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default Notification