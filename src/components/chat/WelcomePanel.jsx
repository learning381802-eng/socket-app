import { useNavigate } from 'react-router-dom'
import { MessageSquare, Plus, Users } from 'lucide-react'
import { useStore } from '../../store'
import Avatar from '../ui/Avatar'

export default function WelcomePanel() {
  const navigate = useNavigate()
  const { user, setModal } = useStore()

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'there'

  return (
    <div className="welcome-panel">
      {/* Welcome icon */}
      <div className="welcome-icon">
        <MessageSquare size={40} />
      </div>

      {/* Welcome text */}
      <h1 className="welcome-title">
        Welcome back, {displayName}!
      </h1>
      <p className="welcome-subtitle">
        Start a conversation, catch up with your messages, or explore spaces to collaborate with your team.
      </p>

      {/* Quick actions */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={() => setModal('new-chat')}
          className="btn-google btn-google-primary"
        >
          <Plus size={18} />
          New Chat
        </button>
        <button
          onClick={() => setModal('new-space')}
          className="btn-google btn-google-secondary"
        >
          <Users size={18} />
          Create Space
        </button>
      </div>

      {/* Tips */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
        <TipCard
          icon={<MessageSquare size={20} />}
          title="Direct Messages"
          description="Send private messages to individuals or small groups"
        />
        <TipCard
          icon={<Users size={20} />}
          title="Spaces"
          description="Collaborate with teams in dedicated channels"
        />
        <TipCard
          icon={<Plus size={20} />}
          title="Quick Actions"
          description="Use @ mentions, reactions, and file sharing"
        />
      </div>
    </div>
  )
}

function TipCard({ icon, title, description }) {
  return (
    <div 
      className="card-google p-4 text-center"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
        style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
      >
        {icon}
      </div>
      <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>
    </div>
  )
}
