import { motion } from 'framer-motion'
import { MessageSquare, Hash, Users, Zap } from 'lucide-react'
import { useStore } from '../../store'

export default function WelcomePanel() {
  const { user, setModal } = useStore()
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'there'

  const cards = [
    {
      icon: <MessageSquare size={22} />,
      title: 'Start a conversation',
      desc: 'Send a direct message to a teammate',
      action: () => setModal('new-chat'),
      color: '#6173f3',
    },
    {
      icon: <Hash size={22} />,
      title: 'Create a space',
      desc: 'A shared channel for your team or project',
      action: () => setModal('new-space'),
      color: '#8b5cf6',
    },
    {
      icon: <Users size={22} />,
      title: 'Group message',
      desc: 'Chat with multiple people at once',
      action: () => setModal('new-group'),
      color: '#06b6d4',
    },
  ]

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center p-8"
      style={{ background: 'var(--bg-primary)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl badge-gradient flex items-center justify-center shadow-glow">
          <Zap size={28} className="text-white" />
        </div>

        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Hey, {displayName} 👋
        </h1>
        <p className="mb-10 text-base" style={{ color: 'var(--text-secondary)' }}>
          Welcome to Socket. Pick up where you left off or start something new.
        </p>

        <div className="grid gap-3">
          {cards.map((card, i) => (
            <motion.button
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={card.action}
              className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = card.color + '60'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: card.color + '20', color: card.color }}
              >
                {card.icon}
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {card.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {card.desc}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
