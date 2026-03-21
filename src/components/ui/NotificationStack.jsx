import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, MessageSquare, X, AlertCircle } from 'lucide-react'
import { useStore } from '../../store'

const icons = {
  success: <CheckCircle size={15} className="text-green-400" />,
  error: <XCircle size={15} className="text-red-400" />,
  message: <MessageSquare size={15} style={{ color: 'var(--accent)' }} />,
  warning: <AlertCircle size={15} className="text-yellow-400" />,
}

const borders = {
  success: '#22c55e',
  error: '#ef4444',
  message: 'var(--accent)',
  warning: '#f59e0b',
}

export default function NotificationStack() {
  const { notifications, removeNotification } = useStore()

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl shadow-panel max-w-sm"
            style={{
              background: 'var(--bg-primary)',
              border: `1px solid var(--border)`,
              borderLeft: `3px solid ${borders[n.type] || borders.message}`,
            }}
          >
            <div className="mt-0.5 shrink-0">{icons[n.type] || icons.message}</div>
            <p className="flex-1 text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
              {n.message}
            </p>
            <button
              onClick={() => removeNotification(n.id)}
              className="shrink-0 p-0.5 rounded-lg opacity-40 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
